// Times search() for a fixed query set on the production-sized catalog. Prints one JSON line.
import { performance } from 'node:perf_hooks'
import { stdout } from 'node:process'
import { search } from '../src/search.mjs'
import { makeCatalog } from './catalog.mjs'
const catalog = makeCatalog()
const queries = ['blue lamp', 'oak table set', 'usb', 'black glass desk', 'mini pro']
const expected = queries.map((query) => search(catalog, query).length)
const RUNS = 7
const timings = []
let errors = 0
for (let run = 0; run < RUNS; run++) {
  const start = performance.now()
  const results = queries.map((query) => search(catalog, query))
  timings.push(performance.now() - start)
  results.forEach((ids, index) => {
    if (ids.length !== expected[index]) errors++
  })
}
timings.sort((a, b) => a - b)
stdout.write(
  JSON.stringify({
    medianMs: Number(timings[3].toFixed(2)),
    range: [Number(timings[0].toFixed(2)), Number(timings[6].toFixed(2))],
    runs: RUNS,
    errors,
    work: expected.reduce((a, b) => a + b, 0),
  }) + '\n',
)
