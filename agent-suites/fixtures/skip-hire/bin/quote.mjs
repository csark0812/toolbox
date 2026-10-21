// npm run quote -- <ref>
// npm run quote -- --size <size> --postcode <postcode> --placement <driveway|private|verge|road> --weeks <n>
import { readFileSync } from 'node:fs'
import { loadBookings, pounds } from '../src/bookings.mjs'
import * as hire from '../src/hire.mjs'

const args = process.argv.slice(2)
const option = (name) => {
  const at = args.indexOf(`--${name}`)
  return at === -1 ? undefined : args[at + 1]
}
let booking
if (args[0] && !args[0].startsWith('--')) {
  booking = loadBookings().find((b) => b.ref === args[0])
  if (!booking) {
    console.error(`No booking ${args[0]}`)
    process.exit(1)
  }
} else {
  booking = {
    size: option('size') ?? 'midi',
    postcode: option('postcode') ?? '',
    placement: option('placement') ?? 'driveway',
    weeks: Number(option('weeks') ?? 1),
  }
}

// Each part of the quote is priced by the <part>Fee function, in the order the office lists them.
const parts = JSON.parse(readFileSync('data/quote-parts.json', 'utf8'))
let total = 0
try {
  const lines = parts.map((part) => {
    const fee = hire[`${part}Fee`]
    if (typeof fee !== 'function') throw new Error(`Nothing prices the ${part} part`)
    const pence = fee(booking)
    total += pence
    return `  ${part.padEnd(10)} ${pounds(pence).padStart(9)}`
  })
  console.log(booking.ref ? `Quote for ${booking.ref}` : 'Quote')
  for (const line of lines) console.log(line)
  console.log(`  ${'total'.padEnd(10)} ${pounds(total).padStart(9)}`)
  if (hire.needsPermit(booking)) console.log('  Includes the council permit.')
} catch (error) {
  console.error(error.message)
  process.exit(1)
}
