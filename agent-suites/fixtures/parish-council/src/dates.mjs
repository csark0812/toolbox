const DAY = 24 * 60 * 60 * 1000
const utc = (date) => {
  const [year, month, day] = date.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

/** The same day `months` later, or the month's last day if it is shorter. */
export function addMonths(date, months) {
  const [year, month, day] = date.split('-').map(Number)
  const last = new Date(Date.UTC(year, month - 1 + months + 1, 0)).getUTCDate()
  return new Date(Date.UTC(year, month - 1 + months, Math.min(day, last)))
    .toISOString()
    .slice(0, 10)
}

/** Whole days from one ISO date to another. */
export function daysBetween(from, to) {
  return Math.round((utc(to) - utc(from)) / DAY)
}
