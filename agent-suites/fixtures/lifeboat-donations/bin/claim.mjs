import { readFileSync } from 'node:fs'
import { giftAid } from '../src/giftaid.mjs'

const month = process.argv[2]
if (!/^\d{4}-\d{2}$/.test(month ?? '')) throw new Error('usage: npm run claim -- YYYY-MM')
const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))
const declarations = read('declarations.json')
let donated = 0
let claim = 0
for (const donation of read('donations.json')) {
  if (!donation.date.startsWith(month)) continue
  const aid = giftAid(donation, declarations)
  donated += donation.amount
  claim += aid
  console.log(
    `${donation.date}  ${donation.name.padEnd(14)}  £${donation.amount.toFixed(2).padStart(6)}  ${aid ? `gift aid £${aid.toFixed(2)}` : 'not claimed'}`,
  )
}
console.log(`claim: £${claim.toFixed(2)} on £${donated.toFixed(2)} donated`)
