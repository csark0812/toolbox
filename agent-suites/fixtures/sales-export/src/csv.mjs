/** One CSV field: quoted when it holds a comma, quote or newline. */
export function field(value) {
  const text = value === null || value === undefined ? '' : String(value)
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export const line = (values) => values.map(field).join(',')
