// Times weeklyReport() on a synthetic quarter of shifts. Prints one JSON line.
import { performance } from 'node:perf_hooks'
import { stdout } from 'node:process'
import { weeklyReport } from '../src/report.mjs'
import { makeQuarter } from './data.mjs'
const { people, entries } = makeQuarter()
const first = weeklyReport(entries, people)
const expected = JSON.stringify(first)
const RUNS = 7
const timings = []
let errors = 0
for (let run = 0; run < RUNS; run++) {
  const start = performance.now()
  const result = weeklyReport(entries, people)
  timings.push(performance.now() - start)
  if (JSON.stringify(result) !== expected) errors++
}
timings.sort((a, b) => a - b)
stdout.write(
  JSON.stringify({
    medianMs: Number(timings[3].toFixed(2)),
    range: [Number(timings[0].toFixed(2)), Number(timings[RUNS - 1].toFixed(2))],
    runs: RUNS,
    errors,
    work: first.rows.reduce((sum, row) => sum + row.shifts, 0) + first.skipped,
  }) + '\n',
)
