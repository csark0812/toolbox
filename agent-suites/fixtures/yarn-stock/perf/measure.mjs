// Times the costing on a year of the shop's books. Prints one JSON line.
import { performance } from 'node:perf_hooks'
import { stdout } from 'node:process'
import { costOfSales } from '../src/fifo.mjs'
import { makeBooks } from './data.mjs'
const { purchases, sales } = makeBooks()
const fingerprint = (out) => JSON.stringify(out)
const expected = fingerprint(costOfSales(purchases, sales))
const RUNS = 7
const timings = []
let errors = 0
let out = { sales: [], stock: [] }
for (let run = 0; run < RUNS; run++) {
  const start = performance.now()
  out = costOfSales(purchases, sales)
  timings.push(performance.now() - start)
  if (fingerprint(out) !== expected) errors++
}
timings.sort((a, b) => a - b)
stdout.write(
  JSON.stringify({
    medianMs: Number(timings[3].toFixed(2)),
    range: [Number(timings[0].toFixed(2)), Number(timings[RUNS - 1].toFixed(2))],
    runs: RUNS,
    errors,
    work: out.sales.length,
    costPence: out.sales.reduce((sum, sale) => sum + sale.cost, 0),
    short: out.sales.reduce((sum, sale) => sum + sale.short, 0),
    stockBalls: out.stock.reduce((sum, line) => sum + line.balls, 0),
    stockPence: out.stock.reduce((sum, line) => sum + line.pence, 0),
  }) + '\n',
)
