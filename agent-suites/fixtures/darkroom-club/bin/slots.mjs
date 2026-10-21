import { readFileSync } from 'node:fs'
import { bookingLine, footer, rota } from '../src/bookings.mjs'

const bookings = JSON.parse(readFileSync(new URL('../data/bookings.json', import.meta.url), 'utf8'))
for (const { booking, clashesWith } of rota(bookings))
  console.log(
    bookingLine(booking) + (clashesWith.length ? `  CLASH with ${clashesWith.join(', ')}` : ''),
  )
console.log(footer())
