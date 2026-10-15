// Time zone helpers built on Intl, so results do not depend on the host's zone.

const offsets = new Map()

/** Minutes to add to a UTC instant to get wall-clock time in `timeZone`. */
function computeOffset(timeZone, date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(date)
  const get = (type) => Number(parts.find((part) => part.type === type).value)
  const wall = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'))
  return Math.round((wall - Math.floor(date.getTime() / 60000) * 60000) / 60000)
}

/** UTC offset in minutes for `timeZone`. Formatting is slow, so offsets are memoized per zone. */
export function utcOffsetMinutes(timeZone, date) {
  if (!offsets.has(timeZone)) offsets.set(timeZone, computeOffset(timeZone, date))
  return offsets.get(timeZone)
}

/** The local calendar day (YYYY-MM-DD) of a UTC instant in `timeZone`. */
export function localDay(isoString, timeZone) {
  const date = new Date(isoString)
  const shifted = new Date(date.getTime() + utcOffsetMinutes(timeZone, date) * 60000)
  return shifted.toISOString().slice(0, 10)
}
