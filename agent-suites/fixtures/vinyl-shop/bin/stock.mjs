import { readFileSync } from 'node:fs'
import { parseStock, reorderSheet } from '../src/stock.mjs'

const rows = parseStock(readFileSync(new URL('../data/stock.csv', import.meta.url), 'utf8'))
const { soldOut, low } = reorderSheet(rows)
const line = (record) => `  ${record.sku}  ${record.artist} - ${record.title} (${record.copies})`
console.log('Sold out')
for (const record of soldOut) console.log(line(record))
console.log('Low stock')
for (const record of low) console.log(line(record))
