const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')

/** A calendar date (`YYYY-MM-DD` or a UTC-midnight Date) as `Wed 4 Nov 2026`. */
export function formatDay(value) {
  const date = value instanceof Date ? value : new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) throw new RangeError(`not a date: ${value}`)
  return `${DAY_NAMES[date.getUTCDay()]} ${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}

/** Days between two calendar dates. */
export const daysBetween = (from, to) =>
  Math.round((new Date(`${to}T00:00:00Z`) - new Date(`${from}T00:00:00Z`)) / 86400000)
