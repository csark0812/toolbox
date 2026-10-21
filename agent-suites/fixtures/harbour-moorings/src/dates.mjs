const DAY = 24 * 60 * 60 * 1000

/** An ISO date such as 2026-03-14, as a UTC timestamp. */
export function fromIso(text) {
  const [year, month, day] = text.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

/** A date from the diving contractor's sheets, as a UTC timestamp. */
export function fromSheet(text) {
  const [month, day, year] = text.split('/').map(Number)
  return Date.UTC(year, month - 1, day)
}

export function toIso(time) {
  return new Date(time).toISOString().slice(0, 10)
}

/** The same day twelve months later. */
export function addYear(time) {
  const date = new Date(time)
  return Date.UTC(date.getUTCFullYear() + 1, date.getUTCMonth(), date.getUTCDate())
}

export function daysBetween(from, to) {
  return Math.round((to - from) / DAY)
}
