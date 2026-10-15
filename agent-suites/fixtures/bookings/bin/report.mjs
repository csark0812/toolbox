import { readFileSync } from 'node:fs'
import { groupByLocalDay } from '../src/report.mjs'

const { timeZone, bookings } = JSON.parse(
  readFileSync(new URL('../data/bookings.json', import.meta.url), 'utf8'),
)
for (const [day, ids] of Object.entries(groupByLocalDay(bookings, timeZone)))
  console.log(`${day}  ${String(ids.length).padStart(2)}  ${ids.join(' ')}`)
