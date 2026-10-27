// Times the leaderboard on the whole county's logs. Prints one JSON line.
import { performance } from 'node:perf_hooks'
import { stdout } from 'node:process'
import { leaderboard } from '../src/board.mjs'
import { makeChallenge } from './data.mjs'
const { logs, books } = makeChallenge()
const fingerprint = (rows) => JSON.stringify(rows)
const expected = fingerprint(leaderboard(logs, books))
const RUNS = 7
const timings = []
let errors = 0
let rows = []
for (let run = 0; run < RUNS; run++) {
  const start = performance.now()
  rows = leaderboard(logs, books)
  timings.push(performance.now() - start)
  if (fingerprint(rows) !== expected) errors++
}
timings.sort((a, b) => a - b)
stdout.write(
  JSON.stringify({
    medianMs: Number(timings[3].toFixed(2)),
    range: [Number(timings[0].toFixed(2)), Number(timings[RUNS - 1].toFixed(2))],
    runs: RUNS,
    errors,
    work: rows.length,
    medals: rows.filter((row) => row.medal).length,
  }) + '\n',
)
