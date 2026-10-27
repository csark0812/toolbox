import { readFileSync } from 'node:fs'
import { buyerTotals, saleResults } from '../src/results.mjs'

const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))
const sale = {
  lots: read('lots.json'),
  bids: read('bids.json'),
  bidders: read('bidders.json'),
  retractions: read('retractions.json'),
}
const results = saleResults(sale)
for (const result of results)
  console.log(
    `lot ${result.lot.padStart(3)}  ${result.sold ? `sold  £${result.price} to ${result.buyer}` : `not sold${result.price ? ` (highest £${result.price})` : ''}`}`,
  )
console.log('')
for (const total of buyerTotals(results, sale.bidders))
  console.log(
    `${total.paddle.padEnd(4)} ${total.name.padEnd(16)} ${total.lots} lots  £${total.owes.toFixed(2)}`,
  )
