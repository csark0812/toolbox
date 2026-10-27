import { readFileSync } from 'node:fs'
import { bookingLine } from '../src/bookings.mjs'

const bookings = JSON.parse(readFileSync(new URL('../data/bookings.json', import.meta.url), 'utf8'))
for (const booking of bookings) console.log(bookingLine(booking))
