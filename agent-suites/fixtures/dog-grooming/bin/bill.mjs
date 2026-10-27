import { readFileSync } from 'node:fs'
import { priceGrooms } from '../src/prices.mjs'

const month = process.argv[2]
if (!/^\d{4}-\d{2}$/.test(month ?? '')) throw new Error('usage: npm run bill -- YYYY-MM')
const grooms = JSON.parse(readFileSync(new URL('../data/grooms.json', import.meta.url), 'utf8'))
let total = 0
for (const { groom, number, free, price } of priceGrooms(grooms)) {
  if (!groom.date.startsWith(month)) continue
  total += price
  const label = `groom ${number}${free ? ' (free)' : ''}`
  console.log(
    `${groom.date}  ${groom.owner.padEnd(8)}  ${groom.dog.padEnd(8)}  ${label.padEnd(14)}  £${price.toFixed(2)}`,
  )
}
console.log(`total: £${total.toFixed(2)}`)
