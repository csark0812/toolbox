const SEND_HOUR = 8

function offsetMinutes(timeZone, instant) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).formatToParts(instant)
  const get = (type) => Number(parts.find((part) => part.type === type).value)
  const wall = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'))
  return (wall - instant.getTime()) / 60000
}

/** 08:00 local time in `timeZone` on the UTC calendar day of `now`, as an ISO string. */
export function sendAtUtc(timeZone, now) {
  const day = new Date(now)
  const localEight = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), SEND_HOUR)
  const offset = offsetMinutes(timeZone, new Date(localEight))
  return new Date(localEight - offset * 60000).toISOString()
}
