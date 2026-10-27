import { readFileSync } from 'node:fs'

const load = (name) => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url)))

let state
/** Reloads the records from data/ (the tests call this between cases). */
export function reset() {
  state = { classes: load('classes'), members: load('members'), bookings: load('bookings') }
}
reset()

export const classes = () => state.classes
export const members = () => state.members
export const bookings = () => state.bookings

/** Stores a booking, replacing the one with the same id. */
export function saveBooking(booking) {
  state.bookings = state.bookings.filter((entry) => entry.id !== booking.id).concat(booking)
}
