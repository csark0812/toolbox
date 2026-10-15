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

/** Verdict rows for every focus arm against the baseline, grouped by each task's target skill. */
export function buildReport({ runs: all, tasks, judgments, baseline = 'none' }) {
  const runs = all.filter((run) => !run.infrastructure)
  const excluded = all.length - runs.length
  const arms = [...new Set(runs.map((run) => run.arm))].filter((arm) => arm !== baseline)
  const resolved = resolveOrders(judgments)
  const health = judgeHealth(judgments)
  const rows = []
  for (const skill of [...new Set(tasks.map((task) => task.targetSkill))])
    for (const focus of arms) {
      const taskIds = new Set(
        tasks.filter((task) => task.targetSkill === skill).map((task) => task.id),
      )
      const outcomes = contrastOutcomes(
        resolved.filter((pair) => taskIds.has(pair.task)),
        focus,
        baseline,
      )
      if (!outcomes.length) continue
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
        runs.filter((run) => taskIds.has(run.task) && run.arm === arm && !run.hardCheck.passed)
          .length
      const defects = { focus: failures(focus), other: failures(baseline) }
      // Cost is reported beside the verdict, never fed to the judge, so it cannot bias quality.
      const costOf = (arm, key) =>
        median(
          runs.filter((run) => taskIds.has(run.task) && run.arm === arm).map((run) => run[key]),
        )
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
      rows.push({
        skill,
        focus,
        baseline,
        ...rate,
        ...interval,
        repeats,
        defects,
        cost,
        verdict: call,
      })
    }
  return { rows, health, excluded }
}

const percent = (value) => (value === null ? '–' : `${Math.round(value * 100)}%`)
const thousands = (value) => `${Math.round(value / 1000)}k`
const seconds = (value) => `${Math.round(value)}s`
/** "focus vs other (ratio×)" for a cost metric, or a dash when either side is missing. */
const pair = (metric, format) =>
  metric?.focus && metric?.other
    ? `${format(metric.focus)} vs ${format(metric.other)} (${(metric.focus / metric.other).toFixed(1)}×)`
    : '–'

export function renderMarkdown(id, { rows, health, excluded = 0 }) {
  const lines = [
    `# Skill bench ${id}`,
    '',
    `Judge v${JUDGE_VERSION}. A verdict needs ${MIN_REPEATS}+ runs per arm per task and a healthy judge. Infrastructure exclusions: ${excluded}.`,
    '',
    '| Skill | Arm vs baseline | W/L/T | Win rate | 95% CI | Runs | Check failures | Median tokens | Median time | Verdict |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...rows.map(
      (row) =>
        `| ${row.skill} | ${row.focus} vs ${row.baseline} | ${row.wins}/${row.losses}/${row.ties} | ${percent(row.rate)} | ${percent(row.lower)}–${percent(row.upper)} | ${row.repeats} | ${row.defects.focus} vs ${row.defects.other} | ${pair(row.cost?.tokens, thousands)} | ${pair(row.cost?.seconds, seconds)} | **${row.verdict}** |`,
    ),
    '',
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
