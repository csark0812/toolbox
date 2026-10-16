const DAY_MS = 24 * 60 * 60 * 1000

/** `YYYY-MM-DD` plus some days, as `YYYY-MM-DD` (UTC calendar arithmetic). */
export function addDays(date, days) {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10)
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** `2027-04-01` as `1 Apr 2027`. */
export function longDate(date) {
  const [year, month, day] = date.split('-').map(Number)
  return `${day} ${MONTHS[month - 1]} ${year}`
}
