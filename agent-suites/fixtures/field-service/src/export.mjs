import { readFileSync } from 'node:fs'
import * as geo from './geo.mjs'
import { assign } from './dispatch.mjs'

const { columns } = JSON.parse(
  readFileSync(new URL('../config/export.json', import.meta.url), 'utf8'),
)
const quote = (value) =>
  /[",\n]/.test(String(value)) ? `"${String(value).replace(/"/g, '""')}"` : String(value)

/** The dispatch sheet as CSV. Formatted columns name a geo helper and the row fields it takes. */
export function exportCsv(callouts, technicians) {
  const rows = assign(callouts, technicians).map(({ callout, tech }) => {
    const row = { ...callout, technician: tech?.name ?? '', base: tech?.base }
    row.km = tech ? geo.haversineKm(tech.base, callout.location) : ''
    return row
  })
  const cell = (row, column) => {
    if (column.field) return row[column.field]
    const inputs = [column.from].flat().map((name) => row[name])
    if (inputs.some((input) => input === undefined || input === '')) return ''
    return geo[column.format](...inputs)
  }
  return [
    columns.map((column) => quote(column.header)).join(','),
    ...rows.map((row) => columns.map((column) => quote(cell(row, column))).join(',')),
  ].join('\n')
}
