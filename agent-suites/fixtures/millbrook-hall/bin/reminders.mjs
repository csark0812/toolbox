import { readFileSync } from 'node:fs'
import { reminder } from '../src/reminders.mjs'

const bookings = JSON.parse(readFileSync(new URL('../data/bookings.json', import.meta.url), 'utf8'))
console.log(bookings.map(reminder).join('\n\n'))
