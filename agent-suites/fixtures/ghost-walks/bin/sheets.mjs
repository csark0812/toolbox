import { load, walkSheet } from '../src/sheet.mjs'

const bookings = load('bookings')
console.log(
  load('walks')
    .map((walk) => walkSheet(walk, bookings).join('\n'))
    .join('\n\n'),
)
