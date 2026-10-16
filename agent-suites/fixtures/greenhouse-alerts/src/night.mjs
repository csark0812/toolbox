import { celsius } from './units.mjs'

/** Readings from 18:00 UTC on `date` to 08:00 UTC the next morning. */
export function nightReadings(readings, date) {
  const from = Date.parse(`${date}T18:00:00Z`)
  const to = from + 14 * 3600000
  return readings.filter((r) => Date.parse(r.at) >= from && Date.parse(r.at) <= to)
}

/** Each greenhouse's lowest temperature in Celsius, by house number. */
export function nightLows(readings) {
  const lows = new Map()
  for (const reading of readings) {
    const value = celsius(reading)
    if (!lows.has(reading.house) || value < lows.get(reading.house)) lows.set(reading.house, value)
  }
  return [...lows].sort(([a], [b]) => a - b)
}
