import { priced } from './catalogue.mjs'

export const SORTS = ['sku', 'qty', 'title']

/** Copies of each zine across every order. */
export function picklist(orders, by = 'sku') {
  if (!SORTS.includes(by)) throw new RangeError(`cannot sort by "${by}"`)
  const totals = new Map()
  for (const order of orders)
    for (const { sku, qty: copies } of order.lines) totals.set(sku, (totals.get(sku) ?? 0) + copies)
  const lines = [...totals].map(([sku, qty]) => priced({ sku, qty }))
  const descending = by === 'qty'
  return lines.sort((a, b) => {
    const order = a[by] < b[by] ? -1 : a[by] > b[by] ? 1 : 0
    return (descending ? -order : order) || a.sku.localeCompare(b.sku)
  })
}
