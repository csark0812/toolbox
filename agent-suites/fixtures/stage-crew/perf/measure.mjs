// Times clash finding on a full season's rota. Prints one JSON line.
import { performance } from 'node:perf_hooks'
import { stdout } from 'node:process'
import { clashes } from '../src/clashes.mjs'
import { makeSeason } from './data.mjs'
const season = makeSeason()
const fingerprint = (list) => JSON.stringify(list)
const expected = fingerprint(clashes(season))
const RUNS = 7
const timings = []
let errors = 0
let list = []
for (let run = 0; run < RUNS; run++) {
  const start = performance.now()
  list = clashes(season)
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
    people: new Set(list.map((clash) => clash.person)).size,
  }) + '\n',
)
