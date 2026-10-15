// Times reconcile() on the month-end data set. Prints one JSON line.
import { performance } from 'node:perf_hooks'
import { stdout } from 'node:process'
import { reconcile } from '../src/reconcile.mjs'
import { makeMonth } from './data.mjs'
const { entries, statement } = makeMonth()
const expected = reconcile(entries, statement).matched.length
const RUNS = 7
const timings = []
let errors = 0
for (let run = 0; run < RUNS; run++) {
  const start = performance.now()
  const result = reconcile(entries, statement)
  timings.push(performance.now() - start)
  if (result.matched.length !== expected) errors++
}
timings.sort((a, b) => a - b)
stdout.write(
  JSON.stringify({
    medianMs: Number(timings[3].toFixed(2)),
    range: [Number(timings[0].toFixed(2)), Number(timings[6].toFixed(2))],
    runs: RUNS,
    errors,
    work: expected,
  }) + '\n',
)
