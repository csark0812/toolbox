import { readFileSync } from 'node:fs'
import { statement } from '../src/pay.mjs'

const month = process.argv[2]
if (!/^\d{4}-\d{2}$/.test(month ?? '')) {
  console.error('usage: npm run statement -- YYYY-MM')
  process.exit(1)
}
const deliveries = JSON.parse(
  readFileSync(new URL('../data/deliveries.json', import.meta.url), 'utf8'),
)
const pounds = (pence) => `£${(pence / 100).toFixed(2)}`
const rows = statement(deliveries, month)
let kg = 0
let pence = 0
for (const row of rows) {
  console.log(
    `${row.member.padEnd(14)}  ${row.kg.toFixed(2).padStart(6)} kg  ${pounds(row.pence).padStart(8)}`,
  )
  kg += row.kg
  pence += row.pence
}
console.log(`${'Total'.padEnd(14)}  ${kg.toFixed(2).padStart(6)} kg  ${pounds(pence).padStart(8)}`)
