#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
const prepared = spawnSync(
  'node',
  ['--experimental-strip-types', 'scripts/prepare-evaluation-workspace.mjs'],
  { stdio: 'inherit' },
)
if (prepared.status !== 0) process.exit(prepared.status ?? 1)
const args = process.argv.slice(2)
const configFlag = args.indexOf('--config')
const config = configFlag >= 0 ? args.splice(configFlag, 2)[1] : 'agent-test.config.ts'
const mode = args.shift() ?? 'live'
const grep = args.shift()
const options = [
  'test',
  '--config',
  config,
  ...(grep ? ['--grep', grep] : []),
  ...(mode === 'comparisons' ? ['--repeat-each', '3'] : []),
]
const result = spawnSync(
  'node',
  ['node_modules/@post-print/agent-test/dist/cli.js', ...options, ...args],
  { stdio: 'inherit' },
)
process.exitCode = result.status ?? 1
