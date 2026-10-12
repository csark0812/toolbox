// Bench state on disk: which executions belong to a bench, the graded runs they hold,
// and the judgment ledger. A bench lives in .agent-test/ui-bench/<bench-id>/.
import { randomUUID } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

export const BENCH_ROOT = resolve('.agent-test/ui-bench')
export const EXECUTIONS_ROOT = resolve('.agent-test/executions')
export const TASKS_ROOT = resolve('agent-suites/fixtures/ui-bench/tasks')
export const REPEATS_PER_BATCH = 2
export const MAX_REPEATS = 6

export const benchDir = (id) => join(BENCH_ROOT, id)

export async function readJson(path, fallback) {
  if (!existsSync(path)) return fallback
  return JSON.parse(await readFile(path, 'utf8'))
}

/**
 * Atomic write so an interrupted judge never leaves a half-written ledger.
 * Each call uses its own temp file: concurrent judge workers save the same ledger.
 */
export async function writeJson(path, value) {
  await mkdir(join(path, '..'), { recursive: true })
  const temp = `${path}.${process.pid}.${randomUUID()}.tmp`
  await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`)
  await rename(temp, path)
}

export async function loadBench(id) {
  const bench = await readJson(join(benchDir(id), 'bench.json'), null)
  if (!bench) throw new Error(`No bench ${id} under ${BENCH_ROOT}`)
  return bench
}

/** Newest bench whose id starts with one of `prefixes`, by the timestamp in the id. */
export async function latestBenchId(prefixes = ['bench-']) {
  const ids = existsSync(BENCH_ROOT)
    ? readdirSync(BENCH_ROOT).filter(
        (name) =>
          prefixes.some((prefix) => name.startsWith(prefix)) &&
          existsSync(join(BENCH_ROOT, name, 'bench.json')),
      )
    : []
  if (!ids.length) throw new Error('No bench yet. Run `npm run bench:ui` first.')
  const stampOf = (name) => name.slice(name.indexOf('-') + 1)
  return ids.sort((a, b) => stampOf(a).localeCompare(stampOf(b))).at(-1)
}

export function loadTasks() {
  return Object.fromEntries(
    readdirSync(TASKS_ROOT).map((id) => {
      const task = JSON.parse(readFileSync(join(TASKS_ROOT, id, 'task.json'), 'utf8'))
      const briefPath = join(TASKS_ROOT, id, 'brief.md')
      return [
        id,
        { ...task, brief: existsSync(briefPath) ? readFileSync(briefPath, 'utf8') : task.prompt },
      ]
    }),
  )
}

/**
 * Graded runs of current tasks across all batches of a bench. A run id is `${task}|${arm}|${repeat}`, where
 * repeat counts across batches (batch b, repeat-each index r → b * REPEATS_PER_BATCH + r).
 */
export function collectRuns(bench) {
  const runs = []
  for (const { id, batch } of bench.executions) {
    const results = join(EXECUTIONS_ROOT, id, 'test-results')
    if (!existsSync(results)) continue
    for (const dir of readdirSync(results)) {
      const path = join(results, dir, 'ui-bench-evidence.json')
      if (!existsSync(path)) continue
      const evidence = JSON.parse(readFileSync(path, 'utf8'))
      if (evidence.outcome !== 'graded') continue
      // Retired tasks (fixture removed) drop out of judging, grading and reports.
      if (!existsSync(join(TASKS_ROOT, evidence.task))) continue
      const repeat = batch * REPEATS_PER_BATCH + evidence.repetition
      runs.push({ runId: `${evidence.task}|${evidence.arm}|${repeat}`, repeat, ...evidence })
    }
  }
  return runs
}
