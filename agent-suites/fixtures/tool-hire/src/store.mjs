import { readFileSync } from 'node:fs'

const load = (name) => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url)))

let state
/** Reloads the records from data/ (the tests call this between cases). */
export function reset() {
  state = {
    tools: load('tools'),
    customers: load('customers'),
    hires: load('hires'),
    refunds: [],
  }
}
reset()

export const tools = () => state.tools
export const customers = () => state.customers
export const hires = () => state.hires
export const refunds = () => state.refunds

/** Queues a deposit refund for the card the customer paid with. */
export function refundDeposit(hireId, pence) {
  state.refunds = state.refunds.concat({ hireId, pence })
}
