import { readFileSync } from 'node:fs'
import { parseCsv, seasonCharges } from '../src/charges.mjs'

const read = (file) => parseCsv(readFileSync(new URL(`../data/${file}`, import.meta.url), 'utf8'))
const total = seasonCharges(read('bookings.csv'), read('members.csv'))
console.log(`Telescope charges this season: £${(total / 100).toFixed(2)}`)
