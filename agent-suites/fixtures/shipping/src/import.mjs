import { quote } from './rates.mjs'

// Column order of the carrier's CSV export. Do not reorder: it mirrors their file.
const COLUMNS = ['weight_kg', 'length_cm', 'width_cm', 'height_cm', 'zone', 'service']

const parseCell = (value, column) =>
  column === 'zone'
    ? value.trim()
    : column === 'service'
      ? value.trim() === 'express'
      : Number(value)

/** Quotes every row of a carrier CSV export (with a header line). Returns cents per row. */
export function quoteCsv(text) {
  const [, ...lines] = text.trim().split('\n')
  return lines.map((line) => {
    const cells = line.split(',').map((value, i) => parseCell(value, COLUMNS[i]))
    return quote(...cells)
  })
}
