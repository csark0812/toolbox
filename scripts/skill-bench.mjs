#!/usr/bin/env node
// Skill bench driver: run arms on blinded tasks, judge pairs, report verdicts.
//   node scripts/skill-bench.mjs run [--arms none,full] [--tasks a,b] [--repeats 4] [--id <id>]
//   run/quick take --runner codex|claude (default codex); judge picks the other family.
//   Any command: --workers <n> agent runs at once (default 4), --judges <n> judge calls at once (default 6)
//   node scripts/skill-bench.mjs judge|report [<id>] [<baseline>]
//   node scripts/skill-bench.mjs fill --id <id> [--taskset holdout] [--arms ...] [--repeats 4]   (top up missing cells)
//   node scripts/skill-bench.mjs preflight
//   node scripts/skill-bench.mjs quick [--arms none,full] [--tasks a,b]   (2 repeats, matched pairs, no verdict)
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const [command = 'run', ...rest] = process.argv.slice(2)
const option = (name, fallback) => {
  const index = rest.indexOf(`--${name}`)
  return index === -1 ? fallback : rest[index + 1]
}
const concurrency = {
  ...(option('workers') ? { SKILL_BENCH_WORKERS: option('workers') } : {}),
  ...(option('judges') ? { SKILL_BENCH_JUDGES: option('judges') } : {}),
}
const step = (args, env = {}, { allowFailure = false } = {}) => {
  const result = spawnSync(process.execPath, args, {
    stdio: 'inherit',
    env: { ...process.env, ...concurrency, ...env },
  })
  if (result.status !== 0 && !allowFailure) process.exit(result.status ?? 1)
}

function run({ arms, tasks, repeats, id, runner = option('runner', 'codex'), grep, offset = 0 }) {
  step(['--experimental-strip-types', 'scripts/prepare-evaluation-workspace.mjs', '--bench'], {
    SKILL_BENCH_RUNNER: runner,
  })
  step(
    [
      'node_modules/@post-print/agent-test/dist/cli.js',
      'test',
      '--config',
      'skill-bench.config.ts',
      '--repeat-each',
      String(repeats),
      ...(grep ? ['--grep', grep] : []),
    ],
    {
      SKILL_BENCH_ARMS: arms,
      SKILL_BENCH_RUNNER: runner,
      SKILL_BENCH_TASKSET: option('taskset', 'tasks'),
      SKILL_BENCH_REP_OFFSET: String(offset),
      SKILL_BENCH_ID: id,
      ...(tasks ? { SKILL_BENCH_TASKS: tasks } : {}),
    },
    // A failed run is reported by the runner; the saved runs are still judged.
    { allowFailure: true },
  )
  console.log(`Bench ${id} runs saved under .agent-test/skill-bench/${id}/runs`)
}

const id = option('id', `bench-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}`)
if (command === 'run')
  run({
    arms: option('arms', 'none,full'),
    tasks: option('tasks'),
    repeats: Number(option('repeats', 4)),
    id,
  })
else if (command === 'preflight')
  run({ arms: 'none,full', tasks: 'session-expiry-fix', repeats: 1, id: `preflight-${id}` })
else if (command === 'quick') {
  const quickId = option('id', `quick-${id}`)
  run({ arms: option('arms', 'none,full'), tasks: option('tasks'), repeats: 2, id: quickId })
  step(['scripts/skill-bench-judge.mjs', quickId, '--matched'])
  step(['scripts/skill-bench-report.mjs', quickId, option('baseline', 'none')])
} else if (command === 'fill') {
  // Rerun each (task, arm) cell that has fewer usable runs than --repeats, with fresh repetition numbers.
  const target = Number(option('repeats', 4))
  const dir = join('.agent-test/skill-bench', id, 'runs')
  const runs = existsSync(dir)
    ? readdirSync(dir).map((file) => JSON.parse(readFileSync(join(dir, file), 'utf8')))
    : []
  const taskset = JSON.parse(
    readFileSync(`agent-suites/skill-bench/${option('taskset', 'tasks')}.json`, 'utf8'),
  )
  const wanted = option('tasks')?.split(',')
  for (const task of taskset.tasks.filter((task) => !wanted || wanted.includes(task.id)))
    for (const arm of option('arms', 'none,full').split(',')) {
      const cell = runs.filter((record) => record.task === task.id && record.arm === arm)
      const missing = target - cell.filter((record) => !record.infrastructure).length
      if (missing <= 0) continue
      const offset = Math.max(-1, ...cell.map((record) => record.repetition)) + 1
      const escaped = `${task.id} [${arm}]`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      console.log(`Filling ${task.id} [${arm}]: ${missing} run(s) from repetition ${offset}`)
      run({ arms: arm, tasks: task.id, repeats: missing, id, grep: escaped, offset })
    }
} else if (command === 'judge') step(['scripts/skill-bench-judge.mjs', ...rest])
else if (command === 'report') step(['scripts/skill-bench-report.mjs', ...rest])
else {
  console.error(`Unknown command ${command}. Use run, preflight, quick, judge or report.`)
  process.exit(1)
}
