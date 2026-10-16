import { totalOf } from './invoice.mjs'
import { formatPrice } from './money.mjs'

/** Columns of the treasurer's export: a value getter and, for money, how to show it. */
export const COLUMNS = [
  { header: 'pitch', value: (stall) => stall.pitch },
  { header: 'trader', value: (stall) => stall.trader },
  { header: 'items', value: (stall) => String(stall.fees.length) },
  { header: 'total', value: totalOf, format: [formatPrice, 'GBP', false, 2] },
]

/** One export cell. Money columns name a formatter and its arguments. */
export function cell(column, stall) {
  const value = column.value(stall)
  if (!column.format) return value
  const [format, ...args] = column.format
  return format(value, ...args)
}
