import { readFileSync, writeFileSync } from 'node:fs'

const file = (name) => new URL(`../data/${name}.json`, import.meta.url)
const load = (name) => JSON.parse(readFileSync(file(name)))

let state
/** Reloads the records from data/ (the tests call this between cases). */
export function reset() {
  state = {
    birds: load('birds'),
    encounters: load('encounters'),
    sites: load('sites'),
    species: load('species'),
  }
}
reset()

export const birds = () => state.birds
export const encounters = () => state.encounters
export const sites = () => state.sites
export const species = () => state.species

/** Replaces the encounter list (used when records are tidied). */
export function setEncounters(list) {
  state.encounters = list
}

/** Writes the birds and encounters back to data/. Only the bin/ scripts call this. */
export function persist() {
  writeFileSync(file('birds'), JSON.stringify(state.birds, null, 2) + '\n')
  writeFileSync(file('encounters'), JSON.stringify(state.encounters, null, 2) + '\n')
}
