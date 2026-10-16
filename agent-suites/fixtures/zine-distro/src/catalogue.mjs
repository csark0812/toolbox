import { readFileSync } from 'node:fs'

export const CATALOGUE = JSON.parse(
  readFileSync(new URL('../data/catalogue.json', import.meta.url), 'utf8'),
)

/** A line with its title and price filled in from the catalogue. */
export function priced(line) {
  const item = CATALOGUE[line.sku]
  if (!item) throw new RangeError(`unknown sku ${line.sku}`)
  return { ...line, ...item }
}
