/** Rows of a simple CSV (no quoted commas) as objects keyed by the header. Values stay strings. */
export function parseCsv(text) {
  const [header, ...lines] = text.trim().split(/\r?\n/)
  const keys = header.split(',')
  return lines.map((line) => {
    const cells = line.split(',')
    return Object.fromEntries(keys.map((key, i) => [key, cells[i]]))
  })
}
