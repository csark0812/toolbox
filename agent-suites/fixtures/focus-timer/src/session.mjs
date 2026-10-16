const DAY_MINUTES = 24 * 60

/** Minutes since midnight from `HH:MM`. */
export function parseClock(text) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(text)
  if (!match) throw new RangeError(`not a time of day: ${text}`)
  return Number(match[1]) * 60 + Number(match[2])
}

const two = (n) => String(n).padStart(2, '0')

/** The clock time `minutes` after `start`, noting when it falls on a later day. */
export function endTime(start, minutes) {
  const total = parseClock(start) + minutes
  const days = Math.floor(total / DAY_MINUTES)
  const time = `${two(Math.floor(total / 60) % 24)}:${two(total % 60)}`
  if (days === 0) return time
  return `${time} (${days === 1 ? 'next day' : `+${days} days`})`
}

export const DEFAULT_MINUTES = 25
