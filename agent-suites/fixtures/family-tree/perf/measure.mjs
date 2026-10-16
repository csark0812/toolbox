// Times a batch of kinship look-ups on the full tree. Prints one JSON line.
import { performance } from 'node:perf_hooks'
import { stdout } from 'node:process'
import { kinship } from '../src/kinship.mjs'
import { makeTree } from './data.mjs'
const { people, lookUps } = makeTree()
const batch = () => lookUps.map(([a, b]) => kinship(people, a, b))
const fingerprint = (results) => JSON.stringify(results)
const expected = fingerprint(batch())
const RUNS = 7
const timings = []
let errors = 0
let results = []
for (let run = 0; run < RUNS; run++) {
  const start = performance.now()
  results = batch()
  timings.push(performance.now() - start)
  if (fingerprint(results) !== expected) errors++
}
timings.sort((a, b) => a - b)
stdout.write(
  JSON.stringify({
    medianMs: Number(timings[3].toFixed(2)),
    range: [Number(timings[0].toFixed(2)), Number(timings[RUNS - 1].toFixed(2))],
    runs: RUNS,
    errors,
    work: results.reduce((sum, r) => sum + (r ? r.up + r.down : 0), 0),
    related: results.filter(Boolean).length,
  }) + '\n',
)
