// Times a day's batch of next-high-water look-ups. Prints one JSON line.
import { performance } from 'node:perf_hooks'
import { stdout } from 'node:process'
import { nextHighWaters } from '../src/tides.mjs'
import { makeBatch } from './data.mjs'
const { tides, queries } = makeBatch()
const fingerprint = (list) => JSON.stringify(list)
const expected = fingerprint(nextHighWaters(tides, queries))
const RUNS = 7
const timings = []
let errors = 0
let answers = []
for (let run = 0; run < RUNS; run++) {
  const start = performance.now()
  answers = nextHighWaters(tides, queries)
  timings.push(performance.now() - start)
  if (fingerprint(answers) !== expected) errors++
}
timings.sort((a, b) => a - b)
stdout.write(
  JSON.stringify({
    medianMs: Number(timings[3].toFixed(2)),
    range: [Number(timings[0].toFixed(2)), Number(timings[RUNS - 1].toFixed(2))],
    runs: RUNS,
    errors,
    work: answers.filter((answer) => answer.tide).length,
    minutes: answers.reduce((sum, answer) => sum + (answer.minutes ?? 0), 0),
  }) + '\n',
)
