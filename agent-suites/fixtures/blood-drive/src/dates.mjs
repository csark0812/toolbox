const DAY = 24 * 60 * 60 * 1000

/** Days since 1970-01-01 for a `YYYY-MM-DD` date, counted in whole calendar days. */
export function dayNumber(date) {
  const [year, month, day] = date.split('-').map(Number)
  return Date.UTC(year, month - 1, day) / DAY
}

/** The `YYYY-MM-DD` date of a day number. */
export function dateOf(dayNumber) {
  return new Date(dayNumber * DAY).toISOString().slice(0, 10)
}
