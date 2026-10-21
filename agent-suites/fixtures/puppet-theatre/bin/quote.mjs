import { parseArgs } from '../src/args.mjs'
import * as office from '../src/box-office.mjs'

const opts = parseArgs(process.argv.slice(2))
const [seat] = opts._
const type = opts.type ?? 'adult'
try {
  if (opts.season) office.setSeason(opts.season)
  // adultPrice, childPrice, concessionPrice
  const price = office[`${type}Price`]
  if (typeof price !== 'function') throw new Error(`Unknown ticket type: ${type}`)
  console.log(
    `${seat} (${office.bandFor(seat)}), ${type}, ${office.currentSeason()}: ${office.pounds(price(seat))}`,
  )
} catch (error) {
  console.error(error.message)
  process.exit(1)
}
