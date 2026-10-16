// Times summarize() on a day of synthetic traffic. Prints one JSON line.
import { performance } from 'node:perf_hooks'
import { stdout } from 'node:process'
import { summarize } from '../src/summarize.mjs'
import { makeDay } from './data.mjs'
const lines = makeDay()
const first = summarize(lines)
const expected = JSON.stringify(first)
const RUNS = 7
const timings = []
let errors = 0
for (let run = 0; run < RUNS; run++) {
  const start = performance.now()
  const result = summarize(lines)
  timings.push(performance.now() - start)
  if (JSON.stringify(result) !== expected) errors++
}
timings.sort((a, b) => a - b)
stdout.write(
  JSON.stringify({
    medianMs: Number(timings[3].toFixed(2)),
    range: [Number(timings[0].toFixed(2)), Number(timings[6].toFixed(2))],
    runs: RUNS,
    errors,
    work: first.routes.reduce((sum, route) => sum + route.count, 0),
  }) + '\n',
)
