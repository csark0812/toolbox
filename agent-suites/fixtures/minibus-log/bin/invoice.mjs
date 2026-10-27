import { readFileSync } from 'node:fs'
import { charge, totalMiles } from '../src/miles.mjs'

const trips = JSON.parse(readFileSync(new URL('../data/trips.json', import.meta.url), 'utf8'))
const groups = [...new Set(trips.map((trip) => trip.group))].sort()

let owed = 0
for (const group of groups) {
  const theirs = trips.filter((trip) => trip.group === group)
  const miles = totalMiles(theirs)
  owed += charge(miles)
  console.log(
    `${group.padEnd(15)}${String(theirs.length).padStart(2)} trips  ${String(miles).padStart(8)} miles  £${charge(miles).toFixed(2)}`,
  )
}
console.log(`Total owed: £${owed.toFixed(2)}`)
