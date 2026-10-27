import { spanMinutes } from './clock.mjs'

export function parseLog(text) {
  const [, ...rows] = text.trim().split('\n')
  return rows.map((row) => {
    const [date, start, end, keeper] = row.split(',')
    return { date, start, end, keeper }
  })
}

/** Minutes the signal sounded on each day of a month, and in total. */
export function monthReport(entries, month) {
  const byDay = new Map()
  for (const entry of entries) {
    if (!entry.date.startsWith(month)) continue
    byDay.set(entry.date, (byDay.get(entry.date) ?? 0) + spanMinutes(entry.start, entry.end))
  }
  const days = [...byDay].sort(([a], [b]) => (a < b ? -1 : 1))
  return { days, total: days.reduce((sum, [, minutes]) => sum + minutes, 0) }
}
