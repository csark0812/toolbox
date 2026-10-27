import { readFileSync } from 'node:fs'

const load = (name) => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url)))

let state
/** Reloads the records from data/ (the tests call this between cases). */
export function reset() {
  state = {
    pitches: load('pitches'),
    guests: load('guests'),
    bookings: load('bookings'),
    refunds: [],
  }
}
reset()

export const pitches = () => state.pitches
export const guests = () => state.guests
export const bookings = () => state.bookings
export const refunds = () => state.refunds

/** Stores a booking, replacing the one with the same id. */
export function saveBooking(booking) {
  state.bookings = state.bookings.filter((entry) => entry.id !== booking.id).concat(booking)
}

/** Queues a refund for the office to pay out. */
export function queueRefund(refund) {
  state.refunds.push(refund)
}
