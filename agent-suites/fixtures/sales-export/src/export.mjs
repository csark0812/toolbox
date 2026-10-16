import { line } from './csv.mjs'

export const HEADER = ['order_id', 'date', 'customer', 'country', 'sku', 'qty', 'amount', 'note']

const dollars = (cents) => {
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(cents)
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`
}

/** A sale record with every field in its export shape. */
function normalize(sale) {
  return {
    ...sale,
    date: new Date(sale.at).toISOString().slice(0, 10),
    customer: sale.customer.trim(),
    country: sale.country.toUpperCase(),
    note: sale.note ?? '',
  }
}

/**
 * Writes the sales CSV to `sink` (anything with a `write(text)` method).
 * Returns { rows, bytes }.
 */
export function exportCsv(sales, sink) {
  const all = [...sales]
  const snapshot = JSON.parse(JSON.stringify(all))
  const rows = snapshot.map(normalize)
  const lines = [line(HEADER)]
  for (const sale of rows)
    lines.push(
      line([
        sale.orderId,
        sale.date,
        sale.customer,
        sale.country,
        sale.sku,
        sale.qty,
        dollars(sale.amountCents),
        sale.note,
      ]),
    )
  const text = lines.join('\n') + '\n'
  sink.write(text)
  return { rows: rows.length, bytes: Buffer.byteLength(text) }
}
