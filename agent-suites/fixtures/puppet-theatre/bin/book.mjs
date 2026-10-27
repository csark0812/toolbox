import { parseArgs } from '../src/args.mjs'
import { book, loadBookings, pounds, setSeason } from '../src/box-office.mjs'

const opts = parseArgs(process.argv.slice(2))
try {
  if (opts.season) setSeason(opts.season)
  const booking = book(loadBookings(opts.file), opts.show, opts.seat, opts.type ?? 'adult')
  console.log(`OK: ${booking.seat} for ${booking.show}, ${booking.type}, ${pounds(booking.pence)}`)
} catch (error) {
  console.error(`Cannot book: ${error.message}`)
  process.exit(1)
}
