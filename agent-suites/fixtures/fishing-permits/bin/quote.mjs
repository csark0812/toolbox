import { argv, exit } from 'node:process'
import { describe, quotePermit } from '../src/permits.mjs'
import { lakeDayTicket } from '../src/presets.mjs'

const [water, days, angler, rods, concession] = argv.slice(2)
try {
  const quote = water
    ? quotePermit(
        water,
        days && Number(days),
        angler,
        rods && Number(rods),
        concession && concession === 'yes',
      )
    : lakeDayTicket()
  console.log(describe(quote))
} catch (error) {
  console.error(error.message)
  exit(1)
}
