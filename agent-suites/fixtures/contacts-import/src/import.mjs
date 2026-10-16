import { normalizeHeader } from './columns.mjs'
import { coerce } from './coerce.mjs'
import { parseCsv } from './csv.mjs'

/** CSV text -> array of records keyed by normalized header. */
export function importContacts(text) {
  const [headerRow, ...rows] = parseCsv(text)
  const columns = headerRow.map(normalizeHeader)
  return rows.map((row) =>
    Object.fromEntries(columns.map((column, i) => [column, coerce(column, row[i] ?? '')])),
  )
}
