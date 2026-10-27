import { readFileSync } from 'node:fs'
import { argv } from 'node:process'
import { BUNKS, monthNights, parseBookings } from '../src/nights.mjs'

const bookings = parseBookings(
  readFileSync(new URL('../data/bookings.csv', import.meta.url), 'utf8'),
)
const month = argv[2] ?? '2026-08'
for (const { night, guests, over } of monthNights(bookings, month)) {
  console.log(`${night}  ${String(guests).padStart(2)}/${BUNKS}${over ? '  OVER' : ''}`)
}
