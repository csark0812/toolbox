#!/usr/bin/env node
import { argv, env, exit, stderr, stdout } from 'node:process'

const command = argv[2]
if (!['status', 'alerts'].includes(command)) {
  stderr.write('usage: brew <status|alerts>\n')
  exit(2)
}
let report, store
try {
  report = await import('../src/report.mjs')
  store = await import('../src/store.mjs')
} catch (error) {
  stderr.write(`${error.message}\n`)
  exit(2)
}
const batches = store.loadBatches()
if (command === 'status') for (const line of report.statusLines(batches)) stdout.write(`${line}\n`)
else {
  const lines = report.alertLines(batches)
  const red = env.NO_COLOR ? (text) => text : (text) => `\u001b[31m${text}\u001b[0m`
  for (const line of lines) stdout.write(`${red(line)}\n`)
  if (lines.length) exit(1)
}
