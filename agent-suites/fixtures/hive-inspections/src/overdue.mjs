import { daysBetween, parseDay } from './dates.mjs'

export const INTERVAL_DAYS = 14

/** The most recent inspection of each hive. */
export function lastInspections(rows) {
  const last = new Map()
  for (const row of rows) {
    const seen = last.get(row.hive)
    if (!seen || row.date > seen.date) last.set(row.hive, row)
  }
  return last
}

/** Hives whose last inspection was more than INTERVAL_DAYS before `today`, longest wait first. */
export function overdue(rows, today) {
  return [...lastInspections(rows).values()]
    .map((row) => ({
      hive: row.hive,
      last: row.date,
      days: daysBetween(parseDay(row.date), today),
    }))
    .filter((hive) => hive.days > INTERVAL_DAYS)
    .sort((a, b) => b.days - a.days || Number(a.hive) - Number(b.hive))
}

/** Every inspection of one hive, oldest first. */
export function history(rows, hive) {
  return rows.filter((row) => row.hive === hive).sort((a, b) => (a.date < b.date ? -1 : 1))
}
