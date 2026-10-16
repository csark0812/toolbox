import * as util from './util.mjs'

// Door-staff table columns. `format` names a helper in util.mjs; `args` are extra show fields
// passed to it.
export const COLUMNS = [
  { title: 'When', key: 'startsAt', format: 'fmtWhen', args: ['timeZone'] },
  { title: 'Artist', key: 'artist' },
  { title: 'Price', key: 'priceCents', format: 'priceLabel' },
  { title: 'Doors', key: 'doors' },
]

export function cell(show, column) {
  const value = show[column.key]
  if (!column.format) return String(value)
  const extra = (column.args ?? []).map((name) => show[name])
  return util[column.format](value, ...extra)
}

export function table(shows) {
  const rows = [COLUMNS.map((c) => c.title), ...shows.map((s) => COLUMNS.map((c) => cell(s, c)))]
  const widths = COLUMNS.map((_, i) => Math.max(...rows.map((r) => r[i].length)))
  return rows
    .map((r) =>
      r
        .map((v, i) => v.padEnd(widths[i]))
        .join(' | ')
        .trimEnd(),
    )
    .join('\n')
}
