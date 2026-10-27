import { readFileSync } from 'node:fs'
import { courtFee, startOf } from '../src/fees.mjs'

const month = process.argv[2]
if (!/^\d{4}-\d{2}$/.test(month ?? '')) {
  console.error('usage: npm run takings -- YYYY-MM')
  process.exit(1)
}
const bookings = JSON.parse(readFileSync(new URL('../data/bookings.json', import.meta.url), 'utf8'))
const pounds = (pence) => `£${(pence / 100).toFixed(2)}`
let total = 0
for (const booking of bookings) {
  const { date } = startOf(booking)
  if (!date.startsWith(month)) continue
  const fee = courtFee(booking)
  console.log(
    `${date} ${booking.start.slice(11, 16)}  court ${booking.court}  ${booking.member.padEnd(11)}  ${pounds(fee)}`,
  )
  total += fee
}
console.log(`Total ${pounds(total)}`)
