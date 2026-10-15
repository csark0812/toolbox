#!/usr/bin/env node
// Calibrates the pairwise win threshold (SCORE_GAP) for code runs. Each real run is judged against
// a weakened twin (same diff, no shown evidence) and against itself. A threshold is good when it
// calls the original better most of the time and almost never calls a winner between identical runs.
// Use development benches only: calibrating on held-out runs would leak them into the method.
//   node scripts/skill-bench-calibrate.mjs <bench-id> [<bench-id>...]
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { mulberry32 } from './lib/pairwise-stats.mjs'
import {
  benchDir,
  judgeFor,
  judgePair,
  knownSkillNames,
  loadRuns,
  loadTasks,
  taskBrief,
} from './skill-bench-judge.mjs'

export const THRESHOLDS = [0.25, 0.5, 0.75, 1]

/** The same work reported without its evidence: a bare claim, and only the edits in the action log. */
export function weaken(run) {
  return {
    ...run,
    id: `${run.id}|weakened`,
    output: 'Fixed it. Tests pass.',
    toolCalls: (run.toolCalls ?? []).filter((call) => /edit|write|patch|apply/i.test(call.name)),
  }
}

/** Mean score gap (original minus other) over both orders of one pair. */
export function meanGap(judgments, originalId) {
  const gaps = judgments.map((judgment) => {
    const original = judgment.first === originalId ? 'first' : 'second'
    const other = original === 'first' ? 'second' : 'first'
    return (judgment.scores?.[original] ?? 0) - (judgment.scores?.[other] ?? 0)
  })
  return gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length
}

/** Per threshold: how often weakened pairs are called for the original, and identical pairs called at all. */
export function calibrationTable(weakenedGaps, identicalGaps) {
  return THRESHOLDS.map((threshold) => ({
    threshold,
    sensitivity: weakenedGaps.filter((gap) => gap >= threshold).length / weakenedGaps.length,
    falseCalls:
      identicalGaps.filter((gap) => Math.abs(gap) >= threshold).length / identicalGaps.length,
  }))
}

/** The smallest threshold whose false-call rate is at most 10%; the most sensitive among safe ones. */
export function chooseThreshold(table) {
  return table.find((row) => row.falseCalls <= 0.1) ?? table.at(-1)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const ids = process.argv.slice(2)
  if (!ids.length) throw new Error('Pass one or more development bench ids')
  const tasks = new Map((await loadTasks()).map((task) => [task.id, task]))
  const skillNames = await knownSkillNames()
  const random = mulberry32(ids.join('|').length * 131)
  const weakenedGaps = []
  const identicalGaps = []
  const jobs = []
  for (const id of ids) {
    const runs = (await loadRuns(id)).filter((run) => !run.infrastructure && run.hardCheck.passed)
    const judge = judgeFor(runs[0]?.runner ?? 'codex')
    for (const run of runs) jobs.push({ run, judge, identical: random() < 0.35 })
  }
  const one = async ({ run, judge, identical }) => {
    const brief = await taskBrief(tasks.get(run.task))
    const ask = (first, second) =>
      judgePair({ brief, first, second, seed: Math.floor(random() * 2 ** 32), skillNames, judge })
    const twin = weaken(run)
    const judgments = []
    for (const [first, second] of [
      [run, twin],
      [twin, run],
    ])
      judgments.push({ ...(await ask(first, second)), first: first.id, second: second.id })
    weakenedGaps.push(meanGap(judgments, run.id))
    if (identical) {
      const verdict = await ask(run, run)
      identicalGaps.push((verdict.scores.first ?? 0) - (verdict.scores.second ?? 0))
    }
    console.log(`  ${run.id}: gap ${weakenedGaps.at(-1).toFixed(2)}`)
  }
  let next = 0
  const worker = async () => {
    while (next < jobs.length) {
      const job = jobs[next++]
      try {
        await one(job)
      } catch (error) {
        console.error(`  ${job.run.id}: ${error.message}`)
      }
    }
  }
  await Promise.all(Array.from({ length: Number(process.env.SKILL_BENCH_JUDGES ?? 6) }, worker))
  const table = calibrationTable(weakenedGaps, identicalGaps)
  const chosen = chooseThreshold(table)
  const result = {
    benches: ids,
    weakenedPairs: weakenedGaps.length,
    identicalPairs: identicalGaps.length,
    table,
    chosen,
  }
  await writeFile(join(benchDir(ids[0]), 'calibration.json'), JSON.stringify(result, null, 2))
  console.log(JSON.stringify(result, null, 2))
}
