import { readFileSync } from 'node:fs'
import { argv } from 'node:process'
import { departureBoards } from '../src/boards.mjs'

const [stopId, date = new Date().toISOString().slice(0, 10)] = argv.slice(2)
const timetable = JSON.parse(
  readFileSync(new URL('../data/timetable.json', import.meta.url), 'utf8'),
)
const board = departureBoards(timetable, date).find((entry) => entry.stop === stopId)
if (!board) {
  console.error(`Unknown stop ${stopId}`)
  process.exit(1)
}
console.log(`${board.name}, ${date}`)
if (!board.departures.length) console.log('No departures.')
for (const departure of board.departures)
  console.log(`${departure.time}  ${departure.route.padEnd(4)} to ${departure.to}`)
