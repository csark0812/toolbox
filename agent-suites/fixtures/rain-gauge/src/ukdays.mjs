const HOUR = 60 * 60 * 1000

/** The last Sunday of a month (1–12) as a UTC midnight. */
export function lastSunday(year, month) {
  const day = new Date(Date.UTC(year, month, 1))
  day.setUTCDate(day.getUTCDate() - day.getUTCDay())
  return day.getTime()
}

/** Whether a UTC instant falls in British Summer Time. */
export function isBst(time) {
  const year = new Date(time).getUTCFullYear()
  const start = lastSunday(year, 3) + HOUR
  const end = lastSunday(year, 10) + HOUR
  return time >= start && time < end
}

/** The UK calendar day (YYYY-MM-DD) of a UTC timestamp such as 2026-10-03T14:05:00Z. */
export function ukDay(stamp) {
  const time = Date.parse(stamp)
  return new Date(time + (isBst(time) ? HOUR : 0)).toISOString().slice(0, 10)
}
