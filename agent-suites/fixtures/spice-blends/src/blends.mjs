import { readFileSync } from 'node:fs'

/** Every blend in the shop's recipe book, by name. */
export function loadBlends() {
  return JSON.parse(readFileSync(new URL('../data/blends.json', import.meta.url), 'utf8'))
}

/** The recipe for one blend, or undefined when the shop has no blend by that name. */
export function findBlend(blends, name) {
  return blends[name.trim().toLowerCase()]
}
