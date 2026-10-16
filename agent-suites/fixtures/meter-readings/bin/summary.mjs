#!/usr/bin/env node
import { argv, exit, stderr, stdout } from 'node:process'
import { monthlySummary } from '../src/summary.mjs'

const file = argv[2]
if (!file) {
  stderr.write('usage: summary <file.csv>\n')
  exit(2)
}
try {
  for (const row of await monthlySummary(file))
    stdout.write(
      `${row.meter}  ${row.month}  ${row.kwh.toFixed(3).padStart(10)} kWh  peak ${row.peakKwh ?? '-'} at ${row.peakAt ?? '-'}  ${row.readings} readings, ${row.gaps} gaps\n`,
    )
} catch (error) {
  stderr.write(`${error.message}\n`)
  exit(1)
}
