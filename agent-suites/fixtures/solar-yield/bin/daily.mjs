#!/usr/bin/env node
import { argv, exit, stderr, stdout } from 'node:process'
import { readMeter } from '../src/meter.mjs'
import { dailyYield } from '../src/yield.mjs'

const month = argv[2]
if (!/^\d{4}-\d{2}$/.test(month ?? '')) {
  stderr.write('usage: daily <YYYY-MM>\n')
  exit(2)
}
for (const day of dailyYield(readMeter()).filter((d) => d.date.startsWith(`${month}-`)))
  stdout.write(
    `${day.date}  ${day.kwh.toFixed(1).padStart(5)} kWh${day.days > 1 ? `  (covers ${day.days} days)` : ''}\n`,
  )
