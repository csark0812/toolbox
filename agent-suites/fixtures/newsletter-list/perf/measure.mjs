// Times the merge on the whole imported history. Prints one JSON line.
import { performance } from 'node:perf_hooks'
import { stdout } from 'node:process'
import { mailOut, mergeSubscribers } from '../src/merge.mjs'
import { makeRows } from './data.mjs'
const rows = makeRows()
const fingerprint = (list) => JSON.stringify(list)
const expected = fingerprint(mergeSubscribers(rows))
const RUNS = 7
const timings = []
let errors = 0
let list = []
for (let run = 0; run < RUNS; run++) {
  const start = performance.now()
  list = mergeSubscribers(rows)
  timings.push(performance.now() - start)
  if (fingerprint(list) !== expected) errors++
}
timings.sort((a, b) => a - b)
stdout.write(
  JSON.stringify({
    medianMs: Number(timings[3].toFixed(2)),
    range: [Number(timings[0].toFixed(2)), Number(timings[RUNS - 1].toFixed(2))],
    runs: RUNS,
    errors,
    work: list.length,
    merged: list.reduce((sum, entry) => sum + entry.rows, 0),
    mailed: mailOut(list).length,
  }) + '\n',
)
