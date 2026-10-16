/** Rows of a survey export as objects keyed by the header line. */
export function parseCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  const [header, ...body] = lines
  const keys = header.split(',').map((key) => key.trim())
  return body.map((line) => {
    const cells = line.split(',').map((cell) => cell.trim())
    return Object.fromEntries(keys.map((key, i) => [key, cells[i] ?? '']))
  })
}

/** A parsed row with its count as a number. */
export function toSighting(row) {
  const count = Number(row.count)
  if (!Number.isInteger(count) || count < 0) throw new RangeError(`bad count "${row.count}"`)
  return { date: row.date, site: row.site, observer: row.observer, species: row.species, count }
}
