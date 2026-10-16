// UTC offsets for every IANA zone, so `zone` lookups are instant.
function offsetLabel(zone, date) {
  const part = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'longOffset' })
    .formatToParts(date)
    .find((p) => p.type === 'timeZoneName')
  return part.value === 'GMT' ? 'UTC+00:00' : part.value.replace('GMT', 'UTC')
}

function buildOffsets(date) {
  const table = new Map()
  for (const zone of Intl.supportedValuesOf('timeZone'))
    for (let hour = 0; hour < 24; hour += 6)
      table.set(`${zone}@${hour}`, offsetLabel(zone, new Date(date.getTime() + hour * 3600000)))
  return table
}

export const OFFSETS = buildOffsets(new Date(Math.floor(Date.now() / 86400000) * 86400000))

/** The UTC offset of `zone` at `date`, like `UTC-05:00`. */
export function offsetAt(zone, date = new Date()) {
  const hour = Math.floor(date.getUTCHours() / 6) * 6
  return OFFSETS.get(`${zone}@${hour}`) ?? offsetLabel(zone, date)
}
