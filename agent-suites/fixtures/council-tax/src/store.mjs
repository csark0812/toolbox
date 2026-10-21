import { readFileSync } from 'node:fs'

const load = (name) => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url)))

let state
/** Reloads the records from data/ (the tests call this between cases). */
export function reset() {
  state = { accounts: load('accounts'), refunds: [] }
}
reset()

export const accounts = () => state.accounts
export const refunds = () => state.refunds

/** Queues a refund to the resident's bank account. */
export function refund(accountRef, pence) {
  state.refunds = state.refunds.concat({ accountRef, pence })
}
