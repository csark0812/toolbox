#!/usr/bin/env node
// Blind pairwise visual judge for the UI benchmark.
// Usage: node scripts/ui-bench-judge.mjs [bench-id]
// Judges every not-yet-judged pair of the bench in both orders, plus controls, with Opus.
import { claude, createAgentSession, createEmptySealedWorkspace } from '@post-print/agent-harness'
import { copyFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  benchDir,
  collectRuns,
  latestBenchId,
  loadBench,
  loadTasks,
  readJson,
  writeJson,
} from './lib/ui-bench-data.mjs'
import { mulberry32 } from './lib/ui-bench-stats.mjs'

export const JUDGE_MODEL = 'claude-opus-5-5'
const CONCURRENCY = 6
const IDENTICAL_SHARE = 0.1
const KNOWN_GAP_PER_BATCH = 5
const RETEST_SHARE = 0.05

export const RUBRIC = `You compare two versions, A and B, of the same web page built for the task below.
Judge only what the screenshots show. Consider, in order of importance:
1. Fit to the task and the stated design system/direction (tokens, tone, required content and states).
2. Visual hierarchy: is the main action and the most important content obvious?
3. Layout quality at the phone width: nothing clipped or overflowing, comfortable spacing, readable line lengths.
4. Alignment, spacing rhythm and typography consistency.
5. Polish: borders, contrast, balance at the desktop width.
Ignore which version you saw first. Prefer "tie" only when neither is better in a way a careful designer would care about.`

/** Pairs to judge: every skill run against every one-liner run of the same task. */
export function plannedPairs(runs) {
  const byTask = Map.groupBy(runs, (run) => run.task)
  const pairs = []
  for (const [task, taskRuns] of byTask) {
    const arm = (name) => taskRuns.filter((run) => run.arm === name)
    for (const skill of arm('skill'))
      for (const oneLiner of arm('one-liner'))
        pairs.push({ task, a: skill.runId, b: oneLiner.runId })
  }
  return pairs.map((pair) => ({ ...pair, pairId: [pair.a, pair.b].sort().join(' vs ') }))
}

export async function judgeBench(id) {
  const bench = await loadBench(id)
  const runs = collectRuns(bench)
  const runsById = new Map(runs.map((run) => [run.runId, run]))
  const tasks = loadTasks()
  const ledgerPath = join(benchDir(id), 'judgments.json')
  const ledger = await readJson(ledgerPath, [])
  const done = new Set(
    ledger.map(
      (entry) => `${entry.pairId}|${entry.first}|${entry.control ?? ''}|${entry.retestOf ?? ''}`,
    ),
  )
  const random = mulberry32(ledger.length + 17)
  const batch = Math.max(...bench.executions.map((execution) => execution.batch))

  const jobs = []
  for (const pair of plannedPairs(runs))
    for (const [first, second] of [
      [pair.a, pair.b],
      [pair.b, pair.a],
    ])
      if (!done.has(`${pair.pairId}|${first}||`))
        jobs.push({ pairId: pair.pairId, task: pair.task, first, second })

  const graded = runs.filter((run) => Object.keys(run.screenshots).length)
  const pick = (list) => list[Math.floor(random() * list.length)]
  for (let i = 0; i < Math.ceil(jobs.length * IDENTICAL_SHARE); i++) {
    const run = pick(graded)
    jobs.push({
      pairId: `${run.runId} identical`,
      task: run.task,
      first: run.runId,
      second: run.runId,
      control: 'identical',
    })
  }
  const knownGapsSoFar = ledger.filter((entry) => entry.control === 'known-gap').length
  for (let i = knownGapsSoFar; i < KNOWN_GAP_PER_BATCH * (batch + 1); i++) {
    const run = pick(
      graded.filter((candidate) => Object.keys(candidate.degradedScreenshots ?? {}).length),
    )
    if (!run) break
    const degraded = `${run.runId}|degraded`
    const [first, second] = random() < 0.5 ? [run.runId, degraded] : [degraded, run.runId]
    jobs.push({
      pairId: `${run.runId} known-gap ${i}`,
      task: run.task,
      first,
      second,
      control: 'known-gap',
      expected: run.runId,
    })
  }
  const real = jobs.filter((job) => !job.control)
  for (let i = 0; i < Math.ceil(real.length * RETEST_SHARE); i++) {
    const original = pick(real)
    jobs.push({ ...original, retestOf: `${original.pairId}|${original.first}` })
  }

  console.log(
    `Bench ${id}: ${runs.length} runs, ${jobs.length} judge calls to make (${ledger.length} already judged).`,
  )
  const shotsOf = (id) => {
    if (id.endsWith('|degraded'))
      return runsById.get(id.replace(/\|degraded$/, '')).degradedScreenshots
    return runsById.get(id).screenshots
  }
  let next = 0
  let completed = 0
  async function worker() {
    while (next < jobs.length) {
      const job = jobs[next++]
      const task = tasks[job.task]
      try {
        const verdict = await judgePair({
          task,
          first: shotsOf(job.first),
          second: shotsOf(job.second),
          shots: task.judgeShots,
          seed: Math.floor(random() * 1e9),
        })
        ledger.push({ ...job, ...verdict, model: JUDGE_MODEL, judgedAt: new Date().toISOString() })
        await writeJson(ledgerPath, ledger)
        completed++
        if (completed % 10 === 0) console.log(`  ${completed}/${jobs.length} judged`)
      } catch (error) {
        console.error(`  judge failed for ${job.pairId} (${job.first} first): ${error.message}`)
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  console.log(`Judged ${completed}/${jobs.length}. Ledger: ${ledgerPath}`)
  return { attempted: jobs.length, completed }
}

/** One blind comparison in a fresh sealed workspace. Only screenshots and the task text go in. */
export async function judgePair({ task, first, second, shots, seed }) {
  const sealed = await createEmptySealedWorkspace()
  const tag = (seed >>> 0).toString(36)
  try {
    const names = { A: [], B: [] }
    for (const [label, set] of [
      ['A', first],
      ['B', second],
    ])
      for (const shot of shots) {
        const name = `${label}-${tag}-${shot}.png`
        await copyFile(set[shot], join(sealed.path, name))
        names[label].push(`${name} (${describeShot(shot)})`)
      }
    await writeFile(join(sealed.path, 'task.md'), task.brief)
    const prompt = `${RUBRIC}

Read task.md for the task. Then open every screenshot with the Read tool:
Version A: ${names.A.join(', ')}
Version B: ${names.B.join(', ')}

Reply with only this JSON:
{"winner": "A" | "B" | "tie", "confidence": 1 | 2 | 3, "reasons": ["short reason", "..."]}`
    const controller = new AbortController()
    const session = await createAgentSession({
      agent: claude({ model: JUDGE_MODEL, auth: { type: 'subscription' } }),
      workspace: sealed.path,
      signal: controller.signal,
      readOnly: true,
    })
    try {
      const trace = await session.run(prompt)
      const text = trace.messages
        .filter((message) => message.role === 'assistant')
        .map((message) => message.content)
        .join('\n')
      const parsed = parseVerdict(text)
      return {
        winner: parsed.winner === 'A' ? 'first' : parsed.winner === 'B' ? 'second' : 'tie',
        confidence: parsed.confidence,
        reasons: parsed.reasons,
        shots,
      }
    } finally {
      await session.close()
    }
  } finally {
    await sealed.cleanup()
  }
}

function describeShot(shot) {
  const [width, scheme] = shot.split('-')
  return `${width}px wide${scheme === 'dark' ? ', dark mode' : ''}`
}

export function parseVerdict(text) {
  const match = [...text.matchAll(/\{[^{}]*"winner"[^{}]*\}/g)].at(-1)
  if (!match) throw new Error(`no verdict JSON in judge reply: ${text.slice(0, 200)}`)
  const parsed = JSON.parse(match[0])
  if (!['A', 'B', 'tie'].includes(parsed.winner)) throw new Error(`bad winner ${parsed.winner}`)
  return parsed
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const id = process.argv[2] ?? (await latestBenchId())
  await judgeBench(id)
}
