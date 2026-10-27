import { readFileSync } from 'node:fs'
import { argv } from 'node:process'
import { parseDonations, parseDonors, quarterClaim } from '../src/giftaid.mjs'

const read = (name) => readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8')
const quarter = argv[2] ?? '2026-Q3'
const donors = parseDonors(read('donors.csv'))
const { gifts, total, giftAid } = quarterClaim(
  parseDonations(read('donations.csv')),
  donors,
  quarter,
)

console.log(`Gift Aid claim for ${quarter}`)
for (const gift of gifts) {
  const name = donors.get(gift.donorId).name
  console.log(
    `${gift.date}  ${gift.donorId}  ${name.padEnd(20)}  ${gift.amount.toFixed(2).padStart(8)}`,
  )
}
console.log(
  `${gifts.length} gifts, total £${total.toFixed(2)}, Gift Aid to claim £${giftAid.toFixed(2)}`,
)
