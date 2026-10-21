import { readFileSync } from 'node:fs'
import { argv } from 'node:process'
import { PLACES, daySlots, parseTickets } from '../src/slots.mjs'

const tickets = parseTickets(readFileSync(new URL('../data/tickets.csv', import.meta.url), 'utf8'))
const date = argv[2] ?? '2026-11-07'
for (const { slot, places, full } of daySlots(tickets, date)) {
  console.log(`${slot}  ${String(places).padStart(2)}/${PLACES}${full ? '  FULL' : ''}`)
}
