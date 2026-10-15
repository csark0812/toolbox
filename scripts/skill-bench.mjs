#!/usr/bin/env node
// Skill bench driver: run arms on blinded tasks, judge pairs, report verdicts.
//   node scripts/skill-bench.mjs run [--arms none,full] [--tasks a,b] [--repeats 4] [--id <id>]
//   node scripts/skill-bench.mjs judge|report [<id>] [<baseline>]
//   node scripts/skill-bench.mjs preflight
import { spawnSync } from 'node:child_process'

const [command = 'run', ...rest] = process.argv.slice(2)
const option = (name, fallback) => {
  const index = rest.indexOf(`--${name}`)
  return index === -1 ? fallback : rest[index + 1]
}
const step = (args, env = {}) => {
  const result = spawnSync(process.execPath, args, {
    stdio: 'inherit',
    env: { ...process.env, ...env },
  })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

function run({ arms, tasks, repeats, id }) {
  step(['--experimental-strip-types', 'scripts/prepare-evaluation-workspace.mjs', '--bench'])
  step(
    [
      'node_modules/@post-print/agent-test/dist/cli.js',
      'test',
      '--config',
      'skill-bench.config.ts',
      '--repeat-each',
      String(repeats),
    ],
    {
      SKILL_BENCH_ARMS: arms,
      SKILL_BENCH_ID: id,
      ...(tasks ? { SKILL_BENCH_TASKS: tasks } : {}),
    },
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
else if (command === 'judge') step(['scripts/skill-bench-judge.mjs', ...rest])
else if (command === 'report') step(['scripts/skill-bench-report.mjs', ...rest])
else {
  console.error(`Unknown command ${command}. Use run, preflight, judge or report.`)
  process.exit(1)
}
