#!/usr/bin/env node
import { exit, stderr, stdout } from 'node:process'
import { parseArgs } from 'node:util'
import { currentAqi } from '../src/aqi.mjs'
import { loadReadings } from '../src/readings.mjs'

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { at: { type: 'string' } },
})
const [room] = positionals
if (!room) {
  stderr.write('usage: aqi <room> [--at <ISO time>]\n')
  exit(2)
}
const readings = loadReadings(new URL(`../data/${room}.csv`, import.meta.url))
const now = values.at ? new Date(values.at.endsWith('Z') ? values.at : `${values.at}Z`) : new Date()
const result = currentAqi(readings, now)
if (!result) stdout.write(`${room}: no recent readings\n`)
else
  stdout.write(
    `${room}: AQI ${result.index} (${result.category}), PM2.5 ${result.pm25.toFixed(1)} µg/m³ from ${result.readings} readings\n`,
  )
