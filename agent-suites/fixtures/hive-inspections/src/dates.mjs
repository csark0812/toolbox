const DAY_MS = 24 * 60 * 60 * 1000

/** `DD/MM/YYYY` as a local midnight Date. */
export function parseDay(text) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text)
  if (!match) throw new RangeError(`not a DD/MM/YYYY date: ${text}`)
  const [, day, month, year] = match.map(Number)
  return new Date(year, month - 1, day)
}

/** `YYYY-MM-DD` as a local midnight Date. */
export function parseIsoDay(text) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text)
  if (!match) throw new RangeError(`not a YYYY-MM-DD date: ${text}`)
  const [, year, month, day] = match.map(Number)
  return new Date(year, month - 1, day)
}

/** Whole days from `from` to `to`. Rounded, so a clock change never shifts the count. */
export function daysBetween(from, to) {
  return Math.round((to - from) / DAY_MS)
}
