import { readFileSync } from 'node:fs'

const load = (name) => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url)))

let state
/** Reloads the records from data/ (the tests call this between cases). */
export function reset() {
  state = {
    instruments: load('instruments'),
    customers: load('customers'),
    rentals: load('rentals'),
    refunds: [],
  }
}
reset()

export const instruments = () => state.instruments
export const customers = () => state.customers
export const rentals = () => state.rentals
export const refunds = () => state.refunds

/** Stores a rental, replacing the one with the same id. */
export function saveRental(rental) {
  state.rentals = state.rentals.filter((entry) => entry.id !== rental.id).concat(rental)
}

/** Queues a refund for the shop to pay out. */
export function queueRefund(refund) {
  state.refunds.push(refund)
}
