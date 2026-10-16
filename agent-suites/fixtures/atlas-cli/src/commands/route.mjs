import { country } from '../countries.mjs'
import { distanceKm } from '../geo.mjs'

export const summary = 'route <from> <to>         great-circle distance between two capitals'
export function run([from, to]) {
  const a = country(from)
  const b = country(to)
  return [`${a.capital} to ${b.capital}: ${Math.round(distanceKm(a, b))} km`]
}
