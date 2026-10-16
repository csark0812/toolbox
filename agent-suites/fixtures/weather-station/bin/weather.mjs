#!/usr/bin/env node
import { argv, exit, stderr, stdout } from 'node:process'
import { loadReadings } from '../src/readings.mjs'
import { dailySummary, daysBetween, formatDay } from '../src/summary.mjs'

const [command, ...args] = argv.slice(2)
const option = (name) => {
  const index = args.indexOf(name)
  return index === -1 ? undefined : args[index + 1]
}
if (command !== 'daily' || !option('--from') || !option('--to')) {
  stderr.write('usage: weather daily --from YYYY-MM-DD --to YYYY-MM-DD\n')
  exit(1)
}
const summary = dailySummary(loadReadings(), daysBetween(option('--from'), option('--to')))
stdout.write(summary.map(formatDay).join('\n') + '\n')
