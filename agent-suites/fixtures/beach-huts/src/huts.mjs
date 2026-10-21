import { readFileSync } from 'node:fs'

/** The huts and their bookings for the season. */
export function loadHuts() {
  return JSON.parse(readFileSync(new URL('../data/huts.json', import.meta.url), 'utf8'))
}

/** One hut's bookings, earliest first. */
export function bookingsFor({ bookings }, hut) {
  return bookings.filter((booking) => booking.hut === hut).sort((a, b) => a.from - b.from)
}
