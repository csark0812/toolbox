#!/usr/bin/env node
// Turns a judged skill bench into one verdict per target skill: focus arm vs baseline arm.
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  MIN_REPEATS,
  clusterBootstrap,
  contrastOutcomes,
  judgeHealth,
  resolveOrders,
  verdict,
  winRate,
} from './lib/pairwise-stats.mjs'
import {
  JUDGE_VERSION,
  benchDir,
  latestBenchId,
  loadLedger,
  loadRuns,
  loadTasks,
} from './skill-bench-judge.mjs'

/** Median of the finite numbers, or null. */
export function median(values) {
  const sorted = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b)
  if (!sorted.length) return null
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

/** Verdict rows for every focus arm against the baseline: one per target skill, then all tasks pooled. */
export function buildReport({ runs: all, tasks, judgments, baseline = 'none' }) {
  const runs = all.filter((run) => !run.infrastructure)
  const excluded = all.length - runs.length
  const arms = [...new Set(runs.map((run) => run.arm))].filter((arm) => arm !== baseline)
  const resolved = resolveOrders(judgments)
  const health = judgeHealth(judgments)
  // Only tasks this bench actually ran: the same skill can also target tasks in another task set.
  const ran = tasks.filter((task) => runs.some((run) => run.task === task.id))
  const contrast = (skill, taskIds, focus) => {
    const outcomes = contrastOutcomes(
      resolved.filter((pair) => taskIds.has(pair.task)),
      focus,
      baseline,
    )
    if (!outcomes.length) return null
    const rate = winRate(outcomes)
    const interval = clusterBootstrap(outcomes)
    const repeats = Math.min(
      ...[focus, baseline].flatMap((arm) =>
        [...taskIds].map(
          (task) => runs.filter((run) => run.task === task && run.arm === arm).length,
        ),
      ),
    )
    const failures = (arm) =>
      runs.filter((run) => taskIds.has(run.task) && run.arm === arm && !run.hardCheck.passed).length
    const defects = { focus: failures(focus), other: failures(baseline) }
    // Cost is reported beside the verdict, never fed to the judge, so it cannot bias quality.
    const costOf = (arm, key) =>
      median(runs.filter((run) => taskIds.has(run.task) && run.arm === arm).map((run) => run[key]))
    const cost = {
      tokens: { focus: costOf(focus, 'tokens'), other: costOf(baseline, 'tokens') },
      seconds: {
        focus: costOf(focus, 'durationMs') / 1000 || null,
        other: costOf(baseline, 'durationMs') / 1000 || null,
      },
    }
    const call =
      repeats < MIN_REPEATS
        ? `signal only (${repeats} run${repeats === 1 ? '' : 's'} per arm)`
        : health.healthy
          ? verdict({ ...rate, ...interval, repeats }, defects)
          : 'withheld'
    return { skill, focus, baseline, ...rate, ...interval, repeats, defects, cost, verdict: call }
  }
  const rows = []
  for (const focus of arms) {
    for (const skill of [...new Set(ran.map((task) => task.targetSkill))]) {
      const row = contrast(
        skill,
        new Set(ran.filter((task) => task.targetSkill === skill).map((task) => task.id)),
        focus,
      )
      if (row) rows.push(row)
    }
    const pooled = contrast(ALL_TASKS, new Set(ran.map((task) => task.id)), focus)
    if (pooled) rows.push(pooled)
  }
  const judges = [...new Set(judgments.map((entry) => entry.model).filter(Boolean))]
  return { rows, health, excluded, judges }
}

/** Label of the row that pools every task the bench ran. */
export const ALL_TASKS = 'all tasks'

/**
 * The strong-claim bar: pooled win rate at least 90% with a lower bound of at least 60%, every
 * skill better, median tokens at least 20% below the baseline's, and a healthy judge. Fixed before
 * the held-out v3 runs and tightened, never loosened, by the user during them.
 */
export function strongClaim({ rows, health }, focus) {
  const skills = rows.filter((row) => row.focus === focus && row.skill !== ALL_TASKS)
  const pooled = rows.find((row) => row.focus === focus && row.skill === ALL_TASKS)
  const ratios = skills
    .map((row) => row.cost.tokens.focus / row.cost.tokens.other)
    .filter(Number.isFinite)
  const checks = [
    { name: 'pooled win rate ≥ 90%', ok: (pooled?.rate ?? 0) >= 0.9 },
    { name: 'pooled lower bound ≥ 60%', ok: (pooled?.lower ?? 0) >= 0.6 },
    {
      name: 'every skill better',
      ok: skills.length > 0 && skills.every((row) => row.verdict === 'better'),
    },
    { name: 'median token ratio ≤ 0.8', ok: (median(ratios) ?? Infinity) <= 0.8 },
    { name: 'judge healthy', ok: health.healthy },
  ]
  return { met: checks.every((check) => check.ok), checks }
}

/**
 * The required bar every held-out set must clear: the pooled verdict is better, every skill is
 * better or saturated (both arms tied on nearly every pair, so nothing could be better), and the
 * judge is healthy. Inconclusive is not enough. Set by the user after held-out v8.
 */
export function requiredBar({ rows, health }, focus) {
  const skills = rows.filter((row) => row.focus === focus && row.skill !== ALL_TASKS)
  const pooled = rows.find((row) => row.focus === focus && row.skill === ALL_TASKS)
  const short = skills.filter((row) => !['better', 'saturated'].includes(row.verdict))
  const checks = [
    { name: 'pooled verdict better', ok: pooled?.verdict === 'better' },
    {
      name: `every skill better or saturated${short.length ? ` (short: ${short.map((row) => `${row.skill} ${row.verdict}`).join(', ')})` : ''}`,
      ok: skills.length > 0 && short.length === 0,
    },
    { name: 'judge healthy', ok: health.healthy },
  ]
  return { met: checks.every((check) => check.ok), checks }
}

const percent = (value) => (value === null ? '–' : `${Math.round(value * 100)}%`)
const thousands = (value) => `${Math.round(value / 1000)}k`
const seconds = (value) => `${Math.round(value)}s`
/** "focus vs other (ratio×)" for a cost metric, or a dash when either side is missing. */
const pair = (metric, format) =>
  metric?.focus && metric?.other
    ? `${format(metric.focus)} vs ${format(metric.other)} (${(metric.focus / metric.other).toFixed(1)}×)`
    : '–'

export function renderMarkdown(id, { rows, health, excluded = 0, judges = [] }) {
  const lines = [
    `# Skill bench ${id}`,
    '',
    `Judge v${JUDGE_VERSION} (${judges.join(', ') || 'none'}). A verdict needs ${MIN_REPEATS}+ runs per arm per task and a healthy judge. Infrastructure exclusions: ${excluded}.`,
    '',
    '| Skill | Arm vs baseline | W/L/T | Win rate | 95% CI | Runs | Check failures | Median tokens | Median time | Verdict |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...rows.map(
      (row) =>
        `| ${row.skill} | ${row.focus} vs ${row.baseline} | ${row.wins}/${row.losses}/${row.ties} | ${percent(row.rate)} | ${percent(row.lower)}–${percent(row.upper)} | ${row.repeats} | ${row.defects.focus} vs ${row.defects.other} | ${pair(row.cost?.tokens, thousands)} | ${pair(row.cost?.seconds, seconds)} | **${row.verdict}** |`,
    ),
    '',
    ...[...new Set(rows.map((row) => row.focus))].flatMap((focus) => {
      const claim = strongClaim({ rows, health }, focus)
      const required = requiredBar({ rows, health }, focus)
      return [
        `## Required bar for ${focus}: ${required.met ? 'met' : 'not met'}`,
        '',
        ...required.checks.map((check) => `- ${check.ok ? 'ok' : 'FAIL'} ${check.name}`),
        '',
        `## Strong claim for ${focus}: ${claim.met ? 'met' : 'not met'}`,
        '',
        ...claim.checks.map((check) => `- ${check.ok ? 'ok' : 'FAIL'} ${check.name}`),
        '',
      ]
    }),
    `## Judge health: ${health.healthy ? 'healthy' : 'unhealthy (verdicts withheld)'}`,
    '',
    ...health.checks.map(
      (check) =>
        `- ${check.ok ? 'ok' : 'FAIL'} ${check.name}: ${check.value === null ? 'n/a' : percent(check.value)} (${check.expect})`,
    ),
    '',
  ]
  return lines.join('\n')
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const id = process.argv[2] ?? (await latestBenchId())
  const baseline = process.argv[3] ?? 'none'
  const judgments = (await loadLedger(id)).filter((entry) => entry.judgeVersion === JUDGE_VERSION)
  const report = buildReport({
    runs: await loadRuns(id),
    tasks: await loadTasks(),
    judgments,
    baseline,
  })
  const markdown = renderMarkdown(id, report)
  await writeFile(join(benchDir(id), 'report.json'), JSON.stringify(report, null, 2))
  await writeFile(join(benchDir(id), 'report.md'), markdown)
  console.log(markdown)
}
