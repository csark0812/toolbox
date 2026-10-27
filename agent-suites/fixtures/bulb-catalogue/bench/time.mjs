// Times buildCatalogue() on last season's stock. Prints one JSON line.
import { performance } from 'node:perf_hooks'
import { stdout } from 'node:process'
import { buildCatalogue } from '../src/catalogue.mjs'
import { makeStock } from './stock.mjs'

const RUNS = 7
const sacks = makeStock()
const expected = new Set(sacks.map((sack) => sack.cultivar)).size
const timings = []
let errors = 0
let work = 0
buildCatalogue(sacks) // warmup, not timed
for (let run = 0; run < RUNS; run++) {
  const start = performance.now()
  const lines = buildCatalogue(sacks)
  timings.push(performance.now() - start)
  work = lines.length
  if (lines.length !== expected) errors++
}
timings.sort((a, b) => a - b)
const medianMs = Number(timings[Math.floor(RUNS / 2)].toFixed(2))
stdout.write(JSON.stringify({ medianMs, runs: RUNS, errors, work }) + '\n')
