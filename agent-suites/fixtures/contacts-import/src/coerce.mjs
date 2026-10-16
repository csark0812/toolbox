// Columns whose values are identifiers, never quantities: always kept as text.
export const TEXT_COLUMNS = new Set(['phone', 'mobile', 'zip', 'postal_code', 'account_id'])

const NUMERIC = /^-?\d+(\.\d+)?$/

/** A raw CSV cell as stored: trimmed, empty -> null, numbers as numbers except text columns. */
export function coerce(column, raw) {
  const value = raw.trim()
  if (value === '') return null
  if (TEXT_COLUMNS.has(column)) return value
  if (NUMERIC.test(value)) return Number(value)
  return value
}
