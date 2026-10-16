// Times a batch of look-ups against a full-size dictionary. Prints one JSON line.
import { performance } from 'node:perf_hooks'
import { stdout } from 'node:process'
import { suggest } from '../src/suggest.mjs'
import { makeArchive } from './data.mjs'
const { dictionary, searches } = makeArchive()
const lookUp = () => searches.map((word) => suggest(dictionary, word))
const fingerprint = (batch) =>
  JSON.stringify(batch.map((list) => list.map((entry) => `${entry.word}:${entry.distance}`)))
const expected = fingerprint(lookUp())
const RUNS = 7
const timings = []
let errors = 0
let batch = []
for (let run = 0; run < RUNS; run++) {
  const start = performance.now()
  batch = lookUp()
  timings.push(performance.now() - start)
  if (fingerprint(batch) !== expected) errors++
}
timings.sort((a, b) => a - b)
stdout.write(
  JSON.stringify({
    medianMs: Number(timings[3].toFixed(2)),
    range: [Number(timings[0].toFixed(2)), Number(timings[RUNS - 1].toFixed(2))],
    runs: RUNS,
    errors,
    work: batch.reduce((sum, list) => sum + list.length, 0),
    exact: batch.filter((list) => list[0]?.distance === 0).length,
  }) + '\n',
)
