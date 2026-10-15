#!/usr/bin/env node
// Judges every not-yet-judged cross-arm pair of a skill bench in both orders, plus identical,
// known-gap and re-test controls, with Opus in an empty sealed workspace per comparison.
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { claude, createAgentSession, createEmptySealedWorkspace } from '@post-print/agent-harness'
import {
  JUDGE_RUBRIC,
  degrade,
  parseVerdict,
  planPairs,
  renderRun,
  runId,
} from './lib/skill-bench-material.mjs'
import { mulberry32 } from './lib/pairwise-stats.mjs'

export const JUDGE_VERSION = 1
export const JUDGE_MODEL = 'claude-opus-5-5'
const CONCURRENCY = 3
const KNOWN_GAPS = 5

export const benchDir = (id) => join('.agent-test/skill-bench', id)

export async function latestBenchId() {
  const ids = await readdir('.agent-test/skill-bench').catch(() => [])
  if (!ids.length) throw new Error('No skill bench runs found under .agent-test/skill-bench')
  return ids.sort().at(-1)
}

export async function loadRuns(id) {
  const dir = join(benchDir(id), 'runs')
  const files = (await readdir(dir)).filter((file) => file.endsWith('.json'))
  const runs = await Promise.all(
    files.map(async (file) => JSON.parse(await readFile(join(dir, file), 'utf8'))),
  )
  return runs.map((run) => ({ ...run, id: runId(run) }))
}

export async function loadTasks() {
  return JSON.parse(await readFile('agent-suites/skill-bench/tasks.json', 'utf8')).tasks
}

export async function loadLedger(id) {
  const path = join(benchDir(id), 'judgments.json')
  return existsSync(path) ? JSON.parse(await readFile(path, 'utf8')) : []
}

/** The task as the judge sees it: the user's request plus criteria the agent never saw. */
async function taskBrief(task) {
  const suite = JSON.parse(await readFile(`agent-suites/${task.suite}/claims.json`, 'utf8'))
  const prompt = (task.prompt ?? suite.scenarios[task.scenario - 1].prompt).replaceAll(
    'agent-suites/fixtures/',
    'projects/',
  )
  return `# Task\n\nThe user asked:\n\n> ${prompt.replaceAll('\n', '\n> ')}\n\n# What matters for this task\n\n${task.criteria.map((criterion) => `- ${criterion}`).join('\n')}\n`
}

export async function judgeBench(id, { matched = false } = {}) {
  const runs = await loadRuns(id)
  const tasks = new Map((await loadTasks()).map((task) => [task.id, task]))
  const arms = [...new Set(runs.map((run) => run.arm))].sort()
  const byId = new Map(runs.map((run) => [run.id, run]))
  const ledger = await loadLedger(id)
  const current = ledger.filter((entry) => entry.judgeVersion === JUDGE_VERSION)
  const done = new Set(
    current.map(
      (entry) => `${entry.pairId}|${entry.first}|${entry.control ?? ''}|${entry.retestOf ?? ''}`,
    ),
  )
  const random = mulberry32(runs.length * 7919 + JUDGE_VERSION)
  const jobs = []
  const pairs = planPairs(runs, arms, { matched })
  for (const pair of pairs)
    for (const [first, second] of [
      [pair.a, pair.b],
      [pair.b, pair.a],
    ])
      jobs.push({ pairId: pair.pairId, task: pair.task, first, second })
  // The identical-pair check needs at least one control, however few pairs a quick bench has.
  const identical = pairs.filter(() => random() < 0.1)
  if (!identical.length && pairs.length) identical.push(pairs[0])
  for (const pair of identical)
    jobs.push({
      pairId: `${pair.a}~${pair.a}`,
      task: pair.task,
      first: pair.a,
      second: pair.a,
      control: 'identical',
    })
  const gapSoFar = current.filter((entry) => entry.control === 'known-gap').length
  for (const run of runs.filter((run) => run.hardCheck.passed).slice(0, KNOWN_GAPS - gapSoFar)) {
    const degraded = degrade(run)
    byId.set(degraded.id, degraded)
    const flip = random() < 0.5
    jobs.push({
      pairId: `${run.id}~${degraded.id}`,
      task: run.task,
      first: flip ? degraded.id : run.id,
      second: flip ? run.id : degraded.id,
      control: 'known-gap',
      expected: run.id,
    })
  }
  for (const job of jobs.filter((job) => !job.control && random() < 0.05))
    jobs.push({ ...job, retestOf: `${job.pairId}|${job.first}` })

  const pending = jobs.filter(
    (job) => !done.has(`${job.pairId}|${job.first}|${job.control ?? ''}|${job.retestOf ?? ''}`),
  )
  console.log(
    `Bench ${id}: ${runs.length} runs, ${pending.length} judge v${JUDGE_VERSION} calls to make (${current.length} already judged).`,
  )
  let next = 0
  const save = () =>
    writeFile(join(benchDir(id), 'judgments.json'), JSON.stringify(ledger, null, 2))
  async function worker() {
    while (next < pending.length) {
      const job = pending[next++]
      const task = tasks.get(job.task)
      try {
        const verdict = await judgePair({
          brief: await taskBrief(task),
          first: byId.get(job.first),
          second: byId.get(job.second),
          seed: Math.floor(random() * 2 ** 32),
        })
        ledger.push({ ...job, ...verdict, model: JUDGE_MODEL, judgeVersion: JUDGE_VERSION })
        await save()
        console.log(`  ${job.control ?? 'pair'} ${job.task}: ${verdict.winner}`)
      } catch (error) {
        console.error(`  judge failed for ${job.pairId}: ${error.message}`)
      }
    }
  }
  await mkdir(benchDir(id), { recursive: true })
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  return ledger
}

/** One blind comparison in a fresh sealed workspace. Only the task and the two rendered runs go in. */
export async function judgePair({ brief, first, second, seed }) {
  const sealed = await createEmptySealedWorkspace()
  const tag = (seed >>> 0).toString(36)
  try {
    const names = { A: `version-A-${tag}.md`, B: `version-B-${tag}.md` }
    await writeFile(join(sealed.path, 'task.md'), brief)
    await writeFile(join(sealed.path, names.A), renderRun(first, 'A'))
    await writeFile(join(sealed.path, names.B), renderRun(second, 'B'))
    const prompt = `${JUDGE_RUBRIC}

Read task.md, then read ${names.A} and ${names.B} in full with the Read tool.

Reply with only this JSON:
{"scoreA": 1-5, "scoreB": 1-5, "winner": "A" | "B" | "tie", "confidence": 1 | 2 | 3, "reasons": ["short reason", "..."]}`
    const parsed = parseVerdict(await askOpus(sealed.path, prompt))
    return {
      winner: parsed.winner === 'A' ? 'first' : parsed.winner === 'B' ? 'second' : 'tie',
      confidence: parsed.confidence,
      scores: { first: parsed.scoreA ?? null, second: parsed.scoreB ?? null },
      reasons: parsed.reasons,
    }
  } finally {
    await sealed.cleanup()
  }
}

async function askOpus(workspace, prompt) {
  const controller = new AbortController()
  const session = await createAgentSession({
    agent: claude({ model: JUDGE_MODEL, auth: { type: 'subscription' } }),
    workspace,
    signal: controller.signal,
    readOnly: true,
  })
  try {
    const trace = await session.run(prompt)
    return trace.messages
      .filter((message) => message.role === 'assistant')
      .map((message) => message.content)
      .join('\n')
  } finally {
    await session.close()
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2)
  const id = args.find((arg) => !arg.startsWith('--')) ?? (await latestBenchId())
  await judgeBench(id, { matched: args.includes('--matched') })
}
