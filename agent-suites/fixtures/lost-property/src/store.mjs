import { readFileSync } from 'node:fs'

const load = (name) => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url)))

let state
/** Reloads the records from data/ (the tests call this between cases). */
export function reset() {
  state = { items: load('items'), claims: load('claim-log') }
}
reset()

export const items = () => state.items
export const claims = () => state.claims

/** Stores an item, replacing the one with the same id. */
export function saveItem(item) {
  state.items = state.items.map((entry) => (entry.id === item.id ? item : entry))
}

/** Stores a claim, replacing the one with the same id. */
export function saveClaim(claim) {
  state.claims = state.claims.filter((entry) => entry.id !== claim.id).concat(claim)
}
