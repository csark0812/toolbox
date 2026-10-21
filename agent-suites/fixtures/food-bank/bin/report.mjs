import { readFileSync } from 'node:fs'
import { weekCounts } from '../src/parcels.mjs'

const referrals = JSON.parse(
  readFileSync(new URL('../data/referrals.json', import.meta.url), 'utf8'),
)
const counts = weekCounts(referrals)
const total = counts.small + counts.medium + counts.large
console.log(`This week: ${total} parcels`)
for (const size of ['small', 'medium', 'large']) console.log(`  ${size.padEnd(7)}${counts[size]}`)
