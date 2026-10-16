#!/usr/bin/env node
import { argv, exit, stderr, stdout } from 'node:process'
import { readMeter } from '../src/meter.mjs'
import { monthlyYield } from '../src/yield.mjs'

const month = argv[2]
if (!/^\d{4}-\d{2}$/.test(month ?? '')) {
  stderr.write('usage: yield <YYYY-MM>\n')
  exit(2)
}
const kwh = monthlyYield(readMeter(), month)
stdout.write(
  kwh === null ? `not enough readings for ${month}\n` : `${month}: ${kwh.toFixed(1)} kWh\n`,
)
