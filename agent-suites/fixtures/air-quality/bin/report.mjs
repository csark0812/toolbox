#!/usr/bin/env node
import { argv, exit, stderr, stdout } from 'node:process'
import { dailyAverage } from '../src/aqi.mjs'
import { loadReadings } from '../src/readings.mjs'

const [room, day] = argv.slice(2)
if (!room || !/^\d{4}-\d{2}-\d{2}$/.test(day ?? '')) {
  stderr.write('usage: report <room> <YYYY-MM-DD>\n')
  exit(2)
}
const result = dailyAverage(loadReadings(new URL(`../data/${room}.csv`, import.meta.url)), day)
if (!result) stdout.write(`${room}: no readings on ${day}\n`)
else
  stdout.write(
    `${room} on ${day}: 24-hour average PM2.5 ${result.pm25} µg/m³ (AQI ${result.index}, ${result.category}) from ${result.readings} readings\n`,
  )
