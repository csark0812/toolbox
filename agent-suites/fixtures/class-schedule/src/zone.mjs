// Time zone helpers built on Intl, so no time zone database ships with the app.

const formatters = new Map()
function partsFormatter(timeZone) {
  if (!formatters.has(timeZone))
    formatters.set(
      timeZone,
      new Intl.DateTimeFormat('en-US', {
        timeZone,
        hourCycle: 'h23',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        weekday: 'short',
      }),
    )
  return formatters.get(timeZone)
}

/** The wall-clock parts of an instant in a time zone. */
export function wallClock(date, timeZone) {
  const parts = Object.fromEntries(
    partsFormatter(timeZone)
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  )
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    weekday: parts.weekday,
  }
}

/** Minutes the zone is ahead of UTC at this instant. */
export function offsetMinutes(date, timeZone) {
  const w = wallClock(date, timeZone)
  const asUtc = Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second)
  return Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000)
}

/** The instant at which the wall clock in `timeZone` reads `date` (YYYY-MM-DD) `time` (HH:MM). */
export function zonedToUtc(date, time, timeZone) {
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  const guess = Date.UTC(y, m - 1, d, hh, mm)
  const first = offsetMinutes(new Date(guess), timeZone)
  const instant = guess - first * 60000
  const second = offsetMinutes(new Date(instant), timeZone)
  return new Date(second === first ? instant : guess - second * 60000)
}

/** `Tue 2026-10-27 18:00` in the given zone. */
export function formatLocal(date, timeZone) {
  const w = wallClock(date, timeZone)
  const pad = (n) => String(n).padStart(2, '0')
  return `${w.weekday} ${w.year}-${pad(w.month)}-${pad(w.day)} ${pad(w.hour)}:${pad(w.minute)}`
}
