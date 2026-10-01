import { spawnSync } from 'node:child_process'
const result = spawnSync(
  'node',
  [
    'scripts/run-agent-suites.mjs',
    'comparisons',
    'probe-fix-(outcomes|transfer|prompt)',
    ...process.argv.slice(2),
  ],
  { stdio: 'inherit' },
)
process.exitCode = result.status ?? 1
