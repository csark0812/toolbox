#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { nightLows, nightReadings } from '../src/night.mjs'

const date = argv[2]
if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) {
  stderr.write('usage: night <YYYY-MM-DD>\n')
  exit(2)
}
const readings = JSON.parse(readFileSync(new URL('../data/readings.json', import.meta.url), 'utf8'))
for (const [house, low] of nightLows(nightReadings(readings, date)))
  stdout.write(`House ${house}  low ${low.toFixed(1)} °C\n`)
