import { priced } from './catalogue.mjs'

const NUMBERS = ['qty', 'unitPence']

/** Rows of a CSV with a header line; numeric columns become numbers. */
export function readCsv(text) {
  const [header, ...rows] = text.trim().split(/\r?\n/)
  const keys = header.split(',')
  return rows.map((row) => {
    const record = Object.fromEntries(row.split(',').map((cell, i) => [keys[i], cell]))
    for (const key of NUMBERS) if (key in record) record[key] = Number(record[key])
    return record
  })
}

/** A shop's re-order sheet as order lines: [{ order, sku, qty }]. */
export function importSheet(text) {
  return readCsv(text).map(({ order, ...line }) => {
    if (!Number.isInteger(line.qty) || line.qty < 1)
      throw new RangeError(`bad quantity for ${line.sku} on ${order}`)
    return { order, ...line }
  })
}

const COLUMNS = [
  ['sku', 'sku'],
  ['title', 'title'],
  ['qty', 'qty'],
  ['unitPence', 'unitPence'],
]

/** An order as CSV for the shop's stock system. */
export function exportCsv(order) {
  const quote = (value) =>
    /[",]/.test(String(value)) ? `"${String(value).replaceAll('"', '""')}"` : value
  const rows = order.lines
    .map(priced)
    .map((line) => COLUMNS.map(([, key]) => quote(line[key])).join(','))
  return [COLUMNS.map(([name]) => name).join(','), ...rows].join('\n') + '\n'
}
