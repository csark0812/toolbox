#!/usr/bin/env node
// UI benchmark driver.
//   node scripts/ui-bench.mjs --preflight      2 tasks × 2 arms × 1 run; checks the render tool is usable
//   node scripts/ui-bench.mjs --quick          the tasks the skills lost, 2 repeats, judged once (~10 min)
//   node scripts/ui-bench.mjs --compare a,b [--tasks x,y] [--model claude-sonnet-5-5] [--repeats 4]
//                                              arms a, b vs the one-liner (interface tasks by default), 2 repeats
//   node scripts/ui-bench.mjs --app piggybank [--arms none,ux-principles] [--model ...] [--repeats 4]
//                                              new screens in a local app fixture, arms as given
//   node scripts/ui-bench.mjs [--bench <id>]   batches of 2 repeats → judge → report, until decided or capped
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import {
  benchDir,
  collectRuns,
  loadTasks,
  EXECUTIONS_ROOT,
  loadBench,
  MAX_REPEATS,
  REPEATS_PER_BATCH,
  writeJson,
} from './lib/ui-bench-data.mjs'
import { loadFixture, prepareAppWorkspace } from '../agent-suites/ui-bench/app-build.mjs'
import { judgeBench } from './ui-bench-judge.mjs'
import { summarize, writeReport } from './ui-bench-report.mjs'

const CONFIGS = [resolve('ui-bench.config.ts'), resolve('ui-bench-app.config.ts')]
const ARM_COUNT = 2
const PREFLIGHT_TASKS = ['settings-form', 'paper-library']
// Tasks where the skill lost to the one-liner in bench-2026-10-09T20-14-21-701Z (batch 1).
const QUICK_TASKS = [
  'settings-form',
  'data-table',
  'site-header',
  'plan-settings',
  'annotations-dashboard',
  'paper-library',
]
const grepFor = (tasks) => `(${tasks.join('|')}) . `
const stamp = () => new Date().toISOString().replace(/[:.]/g, '-')

/** Run the bench suite once; returns the new execution id. `arms` overrides UI_BENCH_ARMS. */
function runSuite(grep, repeatEach, arms, model, app) {
  const startedAt = Date.now()
  const result = spawnSync(
    'node',
    [
      'scripts/run-agent-suites.mjs',
      'live',
      grep,
      '--config',
      app ? 'ui-bench-app.config.ts' : 'ui-bench.config.ts',
      '--repeat-each',
      String(repeatEach),
    ],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        ...(arms ? { UI_BENCH_ARMS: arms.join(',') } : {}),
        ...(model ? { UI_BENCH_AGENT_MODEL: model } : {}),
        ...(app ? { UI_BENCH_APP: app } : {}),
      },
    },
  )
  const execution = readdirSync(EXECUTIONS_ROOT)
    .map((id) => ({ id, path: join(EXECUTIONS_ROOT, id, 'execution.json') }))
    .filter(({ path }) => existsSync(path))
    .map(({ id, path }) => ({ id, ...JSON.parse(readFileSync(path, 'utf8')) }))
    .filter(
      (meta) => CONFIGS.includes(meta.config) && Date.parse(meta.startedAt) >= startedAt - 1000,
    )
    .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt))[0]
  if (!execution) throw new Error(`Suite run produced no execution (exit ${result.status})`)
  return execution.id
}

async function preflight() {
  const id = `preflight-${stamp()}`
  const execution = runSuite(grepFor(PREFLIGHT_TASKS), 1)
  await writeJson(join(benchDir(id), 'bench.json'), {
    id,
    preflight: true,
    executions: [{ id: execution, batch: 0 }],
  })
  const runs = collectRuns(await loadBench(id))
  const expected = PREFLIGHT_TASKS.length * ARM_COUNT
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

/** One batch on the quick task set: a fast before/after signal for skill edits, never a verdict. */
async function quick() {
  const id = `quick-${stamp()}`
  const bench = { id, quick: true, tasks: QUICK_TASKS, executions: [] }
  bench.executions.push({ id: runSuite(grepFor(QUICK_TASKS), REPEATS_PER_BATCH), batch: 0 })
  await writeJson(join(benchDir(id), 'bench.json'), bench)
  await judgeBench(id)
  const report = await writeReport(id)
  console.log(`\n${summarize(report)}`)
  console.log(
    `Quick runs never produce a verdict (fewer than 4 repeats); compare win rates with the previous quick run.`,
  )
  console.log(`Report: ${join(benchDir(id), 'report.html')}`)
}

/** Head-to-head: named arms vs the one-liner, on the given tasks or every page-build task. */
async function compare(challengers, only, model, repeats = REPEATS_PER_BATCH) {
  const id = `compare-${stamp()}`
  const tasks =
    only ??
    Object.values(loadTasks())
      .filter((task) => task.kind === 'page-build')
      .map((task) => task.id)
  const arms = ['one-liner', ...challengers]
  const bench = {
    id,
    compare: arms,
    tasks,
    model: model ?? 'claude-haiku-5-5',
    repeatsPerBatch: repeats,
    executions: [],
  }
  bench.executions.push({ id: runSuite(grepFor(tasks), repeats, arms, model), batch: 0 })
  await writeJson(join(benchDir(id), 'bench.json'), bench)
  await judgeBench(id)
  const report = await writeReport(id)
  console.log(`\n${summarize(report)}`)
  console.log(`Report: ${join(benchDir(id), 'report.html')}`)
  console.log(`Grade it: npm run bench:ui:grade -- ${id}`)
}

/** App fixture: every task with the given arms, judged and reported like any bench. */
async function appBench(name, arms, model, repeats = REPEATS_PER_BATCH) {
  const fixture = loadFixture(name)
  prepareAppWorkspace(fixture)
  const id = `app-${name}-${stamp()}`
  const bench = {
    id,
    app: name,
    arms,
    tasksRoot: fixture.tasksRoot,
    model: model ?? 'claude-sonnet-5-5',
    repeatsPerBatch: repeats,
    executions: [],
  }
  bench.executions.push({ id: runSuite('.', repeats, arms, model, name), batch: 0 })
  await writeJson(join(benchDir(id), 'bench.json'), bench)
  await judgeBench(id)
  const report = await writeReport(id)
  console.log(`\n${summarize(report)}`)
  console.log(`Report: ${join(benchDir(id), 'report.html')}`)
  console.log(`Grade it: npm run bench:ui:grade -- ${id}`)
}

async function full(existing) {
  const id = existing ?? `bench-${stamp()}`
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
  console.log('Next: npm run bench:ui:grade to grade pairs yourself, then npm run bench:ui:report.')
}

const args = process.argv.slice(2)
if (args.includes('--preflight')) await preflight()
else if (args.includes('--quick')) await quick()
else if (args.includes('--app')) {
  const value = (flag) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined)
  await appBench(
    value('--app'),
    (value('--arms') ?? 'none,ux-principles').split(','),
    value('--model'),
    value('--repeats') ? Number(value('--repeats')) : undefined,
  )
} else if (args.includes('--compare')) {
  const listAfter = (flag) =>
    args.includes(flag) ? args[args.indexOf(flag) + 1].split(',') : undefined
  const repeats = listAfter('--repeats')?.[0]
  await compare(
    listAfter('--compare'),
    listAfter('--tasks'),
    listAfter('--model')?.[0],
    repeats ? Number(repeats) : undefined,
  )
} else {
  const flag = args.indexOf('--bench')
  await full(flag >= 0 ? args[flag + 1] : undefined)
}
