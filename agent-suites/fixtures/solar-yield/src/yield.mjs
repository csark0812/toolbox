/**
 * Generation for each logged day: the meter's rise since the previous reading. When the logger
 * misses a night, the next reading's rise covers both days and is credited to the later day, so
 * nothing is lost from the running total.
 */
export function dailyYield(readings) {
  return readings.slice(1).map((reading, i) => ({
    date: reading.date,
    kwh: Math.round((reading.kwh - readings[i].kwh) * 10) / 10,
    days: Math.round((Date.parse(reading.date) - Date.parse(readings[i].date)) / 86400000),
  }))
}

/** A month's generation (`YYYY-MM`): the meter's rise across the month's readings. */
export function monthlyYield(readings, month) {
  const inMonth = readings.filter((reading) => reading.date.startsWith(`${month}-`))
  if (inMonth.length < 2) return null
  return Math.round((inMonth.at(-1).kwh - inMonth[0].kwh) * 10) / 10
}
