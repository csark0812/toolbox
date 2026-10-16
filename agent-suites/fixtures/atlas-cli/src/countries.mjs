import { readFileSync } from 'node:fs'

const countries = JSON.parse(
  readFileSync(new URL('../data/countries.json', import.meta.url), 'utf8'),
)
const byName = new Map(countries.map((country) => [country.name.toLowerCase(), country]))

/** The country record for a name, ignoring case. Throws for an unknown country. */
export function country(name) {
  const found = byName.get(String(name).toLowerCase())
  if (!found) throw new Error(`unknown country: ${name}`)
  return found
}
