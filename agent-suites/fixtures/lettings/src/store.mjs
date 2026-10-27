import { readFileSync } from 'node:fs'

const load = (name) => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url)))

let state
/** Reloads the records from data/ (the tests call this between cases). */
export function reset() {
  state = {
    landlords: load('landlords'),
    tenancies: load('tenancies'),
    deductions: load('deductions'),
  }
}
reset()

export const landlords = () => state.landlords
export const tenancies = () => state.tenancies
export const deductions = () => state.deductions

/** Records a deduction and gives it the next id. */
export function addDeduction(deduction) {
  const row = { id: `d-${state.deductions.length + 1}`, ...deduction }
  state.deductions = state.deductions.concat(row)
  return row
}
