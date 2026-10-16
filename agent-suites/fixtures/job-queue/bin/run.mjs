#!/usr/bin/env node
import { argv, exit, stderr, stdout } from 'node:process'
import { JOBS } from '../src/jobs.mjs'
import { JobTimeout, runWithTimeout } from '../src/runner.mjs'

const args = argv.slice(2)
const name = args.find(
  (arg) => !arg.startsWith('--') && args[args.indexOf(arg) - 1] !== '--timeout',
)
const timeoutIndex = args.indexOf('--timeout')
const timeoutMs = timeoutIndex === -1 ? 30000 : Number(args[timeoutIndex + 1]) * 1000

if (!JOBS[name]) {
  stderr.write(`unknown job ${name ?? ''}\nusage: run <job> [--timeout <seconds>] [--dry-run]\n`)
  exit(1)
}
if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
  stderr.write(`bad --timeout ${args[timeoutIndex + 1]}\n`)
  exit(1)
}
if (args.includes('--dry-run')) {
  stdout.write(`would run ${name} with a ${timeoutMs}ms timeout\n`)
  exit(0)
}
try {
  stdout.write(`${await runWithTimeout(JOBS[name], timeoutMs)}\n`)
} catch (error) {
  if (!(error instanceof JobTimeout)) throw error
  stderr.write(`${name}: ${error.message}\n`)
  exit(2)
}
