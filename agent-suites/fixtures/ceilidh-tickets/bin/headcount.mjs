import { readFileSync } from 'node:fs'
import { HALL_LIMIT, doorSpaces, parseCsv, ticketsSold } from '../src/tickets.mjs'

const sales = parseCsv(readFileSync(new URL('../data/sales.csv', import.meta.url), 'utf8'))

console.log(`People with tickets: ${ticketsSold(sales)}`)
console.log(`Hall limit:          ${HALL_LIMIT}`)
console.log(`Door tickets left:   ${doorSpaces(sales)}`)
