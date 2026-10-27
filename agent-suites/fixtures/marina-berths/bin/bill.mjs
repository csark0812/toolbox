import { readFileSync } from 'node:fs'
import { fee, money } from '../src/berths.mjs'

const visitors = JSON.parse(readFileSync(new URL('../data/visitors.json', import.meta.url), 'utf8'))
for (const boat of visitors) {
  const nightly = fee(boat)
  console.log(
    `${boat.boat.padEnd(12)}${String(boat.lengthM).padStart(5)} m  ${boat.nights} nights x ${money(nightly)}  ${money(nightly * boat.nights)}`,
  )
}
