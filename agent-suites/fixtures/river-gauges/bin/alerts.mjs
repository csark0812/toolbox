import { readFileSync } from 'node:fs'
import { alertPeriods } from '../src/alerts.mjs'

const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))
const periods = alertPeriods(read('readings.json'), read('thresholds.json'))
if (!periods.length) console.log('No alerts.')
for (const period of periods)
  console.log(
    `${period.gauge.padEnd(10)} ${period.from} to ${period.to.slice(11)}  peak ${period.peak.toFixed(2)} m  (${period.readings} readings)`,
  )
