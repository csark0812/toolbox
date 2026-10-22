// Times the catalogue on the whole library. Prints one JSON line.
import { performance } from 'node:perf_hooks'
import { stdout } from 'node:process'
import { catalogue } from '../src/catalogue.mjs'
import { makeLibrary } from './data.mjs'
const { pieces, loans, today } = makeLibrary()
const fingerprint = (out) => JSON.stringify(out)
const expected = fingerprint(catalogue(pieces, loans, today))
const RUNS = 7
const timings = []
let errors = 0
let out = []
for (let run = 0; run < RUNS; run++) {
  const start = performance.now()
  out = catalogue(pieces, loans, today)
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
    work: out.length,
    loans: loans.length,
    out: out.filter((row) => row.status !== 'in').length,
    overdue: out.filter((row) => row.status === 'overdue').length,
    first: out.slice(0, 3).map((row) => row.id),
  }) + '\n',
)
