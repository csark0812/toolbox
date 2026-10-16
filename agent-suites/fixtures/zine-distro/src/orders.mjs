import { priced } from './catalogue.mjs'

/** A line's total in pence. */
export const lineTotal = (line) => line.qty * line.unitPence

/** An order's lines priced, and its total. */
export function invoice(order) {
  const lines = order.lines.map(priced)
  return { ...order, lines, total: lines.reduce((sum, line) => sum + lineTotal(line), 0) }
}

export const pounds = (pence) => `£${(pence / 100).toFixed(2)}`
