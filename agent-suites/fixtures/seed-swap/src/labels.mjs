import Catalog from './catalog.mjs'

/** Sorting-table labels: one per variety, as typed on the packets. */
export function labels(entries) {
  const seen = new Set(entries.map((entry) => entry.variety).map(Catalog.normalize))
  return [...seen].sort().map((name) => name.toUpperCase())
}
