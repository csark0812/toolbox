import { readFileSync } from 'node:fs'
import { totalMiles } from '../src/miles.mjs'

const trips = JSON.parse(readFileSync(new URL('../data/trips.json', import.meta.url), 'utf8'))
console.log(`Minibus mileage this month: ${totalMiles(trips)} miles over ${trips.length} trips`)
