// Public entry for the club website's booking page.
import { WATERS, formatPence, quotePermit } from './permits.mjs'

export { WATERS, formatPence, quotePermit as quote }
export { seasonTicket, weekTicket } from './presets.mjs'

/** The price shown on the booking page, for example "£96.00". */
export function priceFor(water, days, angler) {
  return formatPence(quotePermit(water, days, angler).pence)
}
