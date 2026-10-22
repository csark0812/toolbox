import { readFileSync } from 'node:fs'
import { monthlyPay, parseCsv } from '../src/mileage.mjs'

const month = process.argv[2]
if (!/^\d{4}-\d{2}$/.test(month ?? '')) {
  console.error('usage: npm run payout -- YYYY-MM')
  process.exit(1)
}
const read = (name) => parseCsv(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))
const trips = read('trips.csv')

let total = 0
console.log(`Mileage payout for ${month}`)
for (const { driver } of read('drivers.csv')) {
  const row = monthlyPay(trips, driver, month)
  total += row.pay
  console.log(
    `${driver.padEnd(14)}  ${String(row.miles).padStart(4)} miles at ${row.rate * 100}p  £${row.pay.toFixed(2).padStart(7)}   (${row.before} miles earlier in the tax year)`,
  )
}
console.log(`Total to pay: £${total.toFixed(2)}`)
