import { readFileSync } from 'node:fs'
import { parseArgs } from '../src/args.mjs'
import { loadBookings, setSeason } from '../src/box-office.mjs'

const opts = parseArgs(process.argv.slice(2))
let bookings
try {
  if (opts.season) setSeason(opts.season)
  bookings = loadBookings(opts.file)
} catch (error) {
  console.error(`Cannot report: ${error.message}`)
  process.exit(1)
}
const sections = JSON.parse(readFileSync(new URL('../data/reports.json', import.meta.url), 'utf8'))
for (const section of sections) {
  const mod = await import(`../src/${section.module}.mjs`)
  console.log(`== ${section.title}`)
  for (const line of mod[section.export](bookings)) console.log(line)
}
