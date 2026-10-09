#!/usr/bin/env node
// UI benchmark driver.
//   node scripts/ui-bench.mjs --preflight      2 tasks × 3 arms × 1 run; checks the render tool is usable
//   node scripts/ui-bench.mjs [--bench <id>]   batches of 2 repeats → judge → report, until decided or capped
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import {
  benchDir,
  collectRuns,
  EXECUTIONS_ROOT,
  loadBench,
  MAX_REPEATS,
  REPEATS_PER_BATCH,
  writeJson,
} from './lib/ui-bench-data.mjs'
import { judgeBench } from './ui-bench-judge.mjs'
import { summarize, writeReport } from './ui-bench-report.mjs'

const CONFIG = resolve('ui-bench.config.ts')
const PREFLIGHT_TASKS = ['card-grid', 'paper-library']
const PREFLIGHT_GREP = `(${PREFLIGHT_TASKS.join('|')}) . `

/** Run the bench suite once; returns the new execution id. */
function runSuite(grep, repeatEach) {
  const startedAt = Date.now()
  const result = spawnSync(
    'node',
    [
      'scripts/run-agent-suites.mjs',
      'live',
      grep,
      '--config',
      'ui-bench.config.ts',
      '--repeat-each',
      String(repeatEach),
    ],
    { stdio: 'inherit' },
  )
  const execution = readdirSync(EXECUTIONS_ROOT)
    .map((id) => ({ id, path: join(EXECUTIONS_ROOT, id, 'execution.json') }))
    .filter(({ path }) => existsSync(path))
    .map(({ id, path }) => ({ id, ...JSON.parse(readFileSync(path, 'utf8')) }))
    .filter((meta) => meta.config === CONFIG && Date.parse(meta.startedAt) >= startedAt - 1000)
    .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt))[0]
  if (!execution) throw new Error(`Suite run produced no execution (exit ${result.status})`)
  return execution.id
}

async function preflight() {
  const id = `preflight-${new Date().toISOString().replace(/[:.]/g, '-')}`
  const execution = runSuite(PREFLIGHT_GREP, 1)
  await writeJson(join(benchDir(id), 'bench.json'), {
    id,
    preflight: true,
    executions: [{ id: execution, batch: 0 }],
  })
  const runs = collectRuns(await loadBench(id))
  const expected = PREFLIGHT_TASKS.length * 3
  const rendered = runs.filter((run) => run.renderUsage.rendered)
  console.log(
    `\nPreflight ${id}: ${runs.length}/${expected} runs graded, ${rendered.length} used render_page.`,
  )
  for (const run of runs)
    console.log(
      `  ${run.task} · ${run.arm}: ${run.defects.length} defects, rendered ${run.renderUsage.renderCount}×`,
    )
  const ok = runs.length === expected && rendered.length > 0
  console.log(
    ok
      ? 'Preflight passed.'
      : 'Preflight FAILED: fix the render tool or prompts before a full batch.',
  )
  process.exitCode = ok ? 0 : 1
}

async function full(existing) {
  const id = existing ?? `bench-${new Date().toISOString().replace(/[:.]/g, '-')}`
  const benchPath = join(benchDir(id), 'bench.json')
  const bench = existing ? await loadBench(id) : { id, executions: [] }
  for (let batch = bench.executions.length; batch * REPEATS_PER_BATCH < MAX_REPEATS; batch++) {
    console.log(
      `\n=== Batch ${batch + 1}: repeats ${batch * REPEATS_PER_BATCH + 1}–${(batch + 1) * REPEATS_PER_BATCH} ===`,
    )
    bench.executions.push({ id: runSuite('.', REPEATS_PER_BATCH), batch })
    await writeJson(benchPath, bench)
    await judgeBench(id)
    const report = await writeReport(id)
    console.log(`\n${summarize(report)}`)
    if (report.decided) {
      console.log('Both skills decided. Stopping.')
      break
    }
  }
  console.log(`\nReport: ${join(benchDir(id), 'report.html')}`)
  console.log('Next: npm run bench:ui:calibrate (once), then npm run bench:ui:report.')
}

const args = process.argv.slice(2)
if (args.includes('--preflight')) await preflight()
else {
  const flag = args.indexOf('--bench')
  await full(flag >= 0 ? args[flag + 1] : undefined)
}
