// Times the drink-next list on the whole cellar. Prints one JSON line.
import { performance } from 'node:perf_hooks'
import { stdout } from 'node:process'
import { drinkNext } from '../src/next.mjs'
import { makeCellar } from './data.mjs'
const cellar = makeCellar()
const TODAY = '2026-11-01'
const fingerprint = (list) => JSON.stringify(list)
const expected = fingerprint(drinkNext(cellar, TODAY))
const RUNS = 7
const timings = []
let errors = 0
let list = []
for (let run = 0; run < RUNS; run++) {
  const start = performance.now()
  list = drinkNext(cellar, TODAY)
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
    firsts: list.filter((entry) => entry.rank === 1).length,
  }) + '\n',
)
