import { money } from '../util.mjs'
import { formatDay } from './dates.mjs'

const formatters = { formatDay, money, text: String }

/** The monthly report's columns: title, field and how to show it. */
export const COLUMNS = [
  { title: 'Customer', key: 'name', format: 'text', width: 18 },
  { title: 'Due', key: 'due', format: 'formatDay', width: 16 },
  { title: 'Booked', key: 'visit', format: 'formatDay', width: 16 },
  { title: 'Cover', key: 'cover', format: 'money', width: 8 },
]

export function renderTable(rows) {
  const cell = (column, value) =>
    (value === null || value === undefined ? '-' : formatters[column.format](value)).padEnd(
      column.width,
    )
  const lines = [
    COLUMNS.map((column) => column.title.padEnd(column.width))
      .join(' ')
      .trimEnd(),
  ]
  for (const row of rows)
    lines.push(
      COLUMNS.map((column) => cell(column, row[column.key]))
        .join(' ')
        .trimEnd(),
    )
  return lines
}
