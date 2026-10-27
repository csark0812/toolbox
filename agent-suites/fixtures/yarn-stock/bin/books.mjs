import { readFileSync } from 'node:fs'
import { costOfSales } from '../src/fifo.mjs'

const { purchases, sales } = JSON.parse(
  readFileSync(new URL('../data/books.json', import.meta.url), 'utf8'),
)
const money = (pence) => `£${(pence / 100).toFixed(2)}`
const result = costOfSales(purchases, sales)
for (const sale of result.sales) {
  console.log(
    `${sale.id}  ${sale.sku.padEnd(7)} ${money(sale.cost).padStart(7)}${sale.short ? `  short ${sale.short}` : ''}`,
  )
}
console.log('Stock')
for (const line of result.stock)
  console.log(
    `${line.sku.padEnd(7)} ${String(line.balls).padStart(3)}  ${money(line.pence).padStart(7)}`,
  )
