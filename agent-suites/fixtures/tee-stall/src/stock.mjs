import { readFileSync } from 'node:fs'

/** Every stock row from the last count. */
export function loadStock() {
  return JSON.parse(readFileSync(new URL('../data/stock.json', import.meta.url), 'utf8'))
}

/** Rows grouped by design, in the order each design first appears. */
export function byDesign(rows) {
  const designs = new Map()
  for (const row of rows) {
    if (!designs.has(row.design)) designs.set(row.design, [])
    designs.get(row.design).push(row)
  }
  return designs
}
