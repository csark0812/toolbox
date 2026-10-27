import { quotePermit } from './permits.mjs'

/** The club lake day ticket sold at the counter. */
export const lakeDayTicket = quotePermit.bind(null, 'lake', 1)

/** A season is 26 weeks on one rod, always with the members' concession. */
export const seasonTicket = (water, angler) => quotePermit(water, 7 * 26, angler, undefined, true)

/** A week's holiday ticket: never a concession, even for juniors. */
export const weekTicket = (water, angler) => quotePermit(water, 7, angler, undefined, false)
