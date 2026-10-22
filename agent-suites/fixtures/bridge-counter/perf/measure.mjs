// Times the report on a season of uploads. Prints one JSON line.
import { performance } from 'node:perf_hooks'
import { stdout } from 'node:process'
import { dailyReport } from '../src/report.mjs'
import { makeUploads } from './data.mjs'
const readings = makeUploads()
const fingerprint = (out) => JSON.stringify(out)
const expected = fingerprint(dailyReport(readings))
const RUNS = 7
const timings = []
let errors = 0
let out = []
for (let run = 0; run < RUNS; run++) {
  const start = performance.now()
  out = dailyReport(readings)
  timings.push(performance.now() - start)
  if (fingerprint(out) !== expected) errors++
}
timings.sort((a, b) => a - b)
stdout.write(
  JSON.stringify({
    medianMs: Number(timings[3].toFixed(2)),
    range: [Number(timings[0].toFixed(2)), Number(timings[RUNS - 1].toFixed(2))],
    runs: RUNS,
    errors,
    work: readings.length,
    days: out.length,
    crossings: out.reduce((sum, row) => sum + row.total, 0),
    lastRolling: out.at(-1)?.rolling7,
  }) + '\n',
)
