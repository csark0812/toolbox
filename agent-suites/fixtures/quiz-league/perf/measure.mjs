// Times the league table on a full season. Prints one JSON line.
import { performance } from 'node:perf_hooks'
import { stdout } from 'node:process'
import { standings } from '../src/league.mjs'
import { makeSeason } from './data.mjs'
const { teams, nights } = makeSeason()
const fingerprint = (table) => JSON.stringify(table)
const expected = fingerprint(standings(teams, nights))
const RUNS = 7
const timings = []
let errors = 0
let table = []
for (let run = 0; run < RUNS; run++) {
  const start = performance.now()
  table = standings(teams, nights)
  timings.push(performance.now() - start)
  if (fingerprint(table) !== expected) errors++
}
timings.sort((a, b) => a - b)
stdout.write(
  JSON.stringify({
    medianMs: Number(timings[3].toFixed(2)),
    range: [Number(timings[0].toFixed(2)), Number(timings[RUNS - 1].toFixed(2))],
    runs: RUNS,
    errors,
    work: table.length,
    points: table.reduce((sum, row) => sum + row.points, 0),
    played: table.reduce((sum, row) => sum + row.played, 0),
  }) + '\n',
)
