// Times the results and buyer totals on a full day's sale. Prints one JSON line.
import { performance } from 'node:perf_hooks'
import { stdout } from 'node:process'
import { buyerTotals, saleResults } from '../src/results.mjs'
import { makeSale } from './data.mjs'
const sale = makeSale()
const run = () => {
  const results = saleResults(sale)
  return { results, totals: buyerTotals(results, sale.bidders) }
}
const fingerprint = (outcome) => JSON.stringify(outcome)
const expected = fingerprint(run())
const RUNS = 7
const timings = []
let errors = 0
let outcome
for (let n = 0; n < RUNS; n++) {
  const start = performance.now()
  outcome = run()
  timings.push(performance.now() - start)
  if (fingerprint(outcome) !== expected) errors++
}
timings.sort((a, b) => a - b)
stdout.write(
  JSON.stringify({
    medianMs: Number(timings[3].toFixed(2)),
    range: [Number(timings[0].toFixed(2)), Number(timings[RUNS - 1].toFixed(2))],
    runs: RUNS,
    errors,
    work: outcome.results.filter((result) => result.sold).length,
    buyers: outcome.totals.length,
  }) + '\n',
)
