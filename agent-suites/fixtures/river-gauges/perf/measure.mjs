// Times the alert periods on a month of the whole catchment. Prints one JSON line.
import { performance } from 'node:perf_hooks'
import { stdout } from 'node:process'
import { alertPeriods } from '../src/alerts.mjs'
import { makeReadings } from './data.mjs'
const { readings, thresholds } = makeReadings()
const fingerprint = (periods) => JSON.stringify(periods)
const expected = fingerprint(alertPeriods(readings, thresholds))
const RUNS = 7
const timings = []
let errors = 0
let periods = []
for (let run = 0; run < RUNS; run++) {
  const start = performance.now()
  periods = alertPeriods(readings, thresholds)
  timings.push(performance.now() - start)
  if (fingerprint(periods) !== expected) errors++
}
timings.sort((a, b) => a - b)
stdout.write(
  JSON.stringify({
    medianMs: Number(timings[3].toFixed(2)),
    range: [Number(timings[0].toFixed(2)), Number(timings[RUNS - 1].toFixed(2))],
    runs: RUNS,
    errors,
    work: periods.length,
    alertReadings: periods.reduce((sum, period) => sum + period.readings, 0),
  }) + '\n',
)
