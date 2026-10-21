// Times the whole club's handicap history. Prints one JSON line.
import { performance } from 'node:perf_hooks'
import { stdout } from 'node:process'
import { handicapHistory } from '../src/handicap.mjs'
import { makeClub } from './data.mjs'
const { rounds, courses } = makeClub()
const fingerprint = (list) => JSON.stringify(list)
const expected = fingerprint(handicapHistory(rounds, courses))
const RUNS = 7
const timings = []
let errors = 0
let history = []
for (let run = 0; run < RUNS; run++) {
  const start = performance.now()
  history = handicapHistory(rounds, courses)
  timings.push(performance.now() - start)
  if (fingerprint(history) !== expected) errors++
}
timings.sort((a, b) => a - b)
stdout.write(
  JSON.stringify({
    medianMs: Number(timings[3].toFixed(2)),
    range: [Number(timings[0].toFixed(2)), Number(timings[RUNS - 1].toFixed(2))],
    runs: RUNS,
    errors,
    work: history.filter((entry) => entry.index !== null).length,
    total: history.reduce((sum, entry) => sum + (entry.index ?? 0), 0),
  }) + '\n',
)
