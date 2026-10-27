// Times the statements on four seasons of books. Prints one JSON line.
import { performance } from 'node:perf_hooks'
import { stdout } from 'node:process'
import { statements } from '../src/statements.mjs'
import { makeBooks } from './data.mjs'
const { members, trips, costs } = makeBooks()
const fingerprint = (out) => JSON.stringify(out)
const expected = fingerprint(statements(members, trips, costs))
const RUNS = 7
const timings = []
let errors = 0
let out = []
for (let run = 0; run < RUNS; run++) {
  const start = performance.now()
  out = statements(members, trips, costs)
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
    work: out.reduce((sum, statement) => sum + statement.lines.length, 0),
    billed: out.reduce((sum, statement) => sum + statement.total, 0),
    totals: out.map((statement) => statement.total),
  }) + '\n',
)
