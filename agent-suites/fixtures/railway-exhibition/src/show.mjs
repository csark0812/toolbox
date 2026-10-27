import { readFileSync } from 'node:fs'

export const show = JSON.parse(readFileSync(new URL('../data/show.json', import.meta.url), 'utf8'))

// Doors open, in UTC (March is still GMT, so this is 10am on the day).
export const SHOW_START = Date.UTC(2027, 2, 13, 10)

const DAY_MS = 24 * 60 * 60 * 1000

export function daysToGo(today) {
  const from = Date.parse(`${today}T00:00:00Z`)
  return Math.floor((SHOW_START - from) / DAY_MS)
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export function longDate(iso) {
  const day = new Date(`${iso}T00:00:00Z`)
  return `${DAYS[day.getUTCDay()]} ${day.getUTCDate()} ${MONTHS[day.getUTCMonth()]} ${day.getUTCFullYear()}`
}

export const fill = (template, values) =>
  template.replace(/\{(\w+)\}/g, (match, key) => (key in values ? values[key] : match))
