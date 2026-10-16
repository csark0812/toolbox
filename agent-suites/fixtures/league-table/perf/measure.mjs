// Times the position chart for a batch of full-size seasons. Prints one JSON line.
import { performance } from 'node:perf_hooks'
import { stdout } from 'node:process'
import { progression } from '../src/standings.mjs'
import { makeSeasons } from './data.mjs'
const seasons = makeSeasons()
const chart = () => seasons.map((season) => progression(season))
const fingerprint = (charts) =>
  JSON.stringify(charts.map((tables) => tables.map((t) => t.map((r) => `${r.team}:${r.points}`))))
const expected = fingerprint(chart())
const RUNS = 7
const timings = []
let errors = 0
let charts = []
for (let run = 0; run < RUNS; run++) {
  const start = performance.now()
  charts = chart()
  timings.push(performance.now() - start)
  if (fingerprint(charts) !== expected) errors++
}
timings.sort((a, b) => a - b)
stdout.write(
  JSON.stringify({
    medianMs: Number(timings[3].toFixed(2)),
    range: [Number(timings[0].toFixed(2)), Number(timings[RUNS - 1].toFixed(2))],
    runs: RUNS,
    errors,
    work: charts.reduce((sum, tables) => sum + tables.length, 0),
    championPoints: charts.reduce((sum, tables) => sum + tables.at(-1)[0].points, 0),
  }) + '\n',
)
