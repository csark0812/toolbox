import { readFileSync, writeFileSync } from 'node:fs'

const file = (name) => new URL(`../data/${name}.json`, import.meta.url)
const load = (name) => JSON.parse(readFileSync(file(name)))

let state
/** Reloads the records from data/ (the tests call this between cases). */
export function reset() {
  state = { classes: load('classes'), pupils: load('pupils'), invoices: load('invoices') }
}
reset()

export const classes = () => state.classes
export const pupils = () => state.pupils
export const invoices = () => state.invoices

/** Replaces the invoice list. */
export function setInvoices(list) {
  state.invoices = list
}

/** Writes the invoice list back to data/invoices.json. */
export function persist() {
  writeFileSync(file('invoices'), JSON.stringify(state.invoices, null, 2) + '\n')
}
