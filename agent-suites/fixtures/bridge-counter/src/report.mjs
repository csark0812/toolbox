// Daily figures for the footbridge counter.

const DAY_MS = 24 * 60 * 60 * 1000

/** The UTC day of a reading, like "2026-03-28". Times carry the counter's own offset. */
function dayOf(at) {
  return new Date(at).toISOString().slice(0, 10)
}

/** The UTC hour of a reading, 0 to 23. */
function hourOf(at) {
  return new Date(at).getUTCHours()
}

function addDays(day, n) {
  return new Date(Date.parse(`${day}T00:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10)
}

/** A sensor fault is logged as a missing or negative count. */
function isValid(reading) {
  return typeof reading.count === 'number' && reading.count >= 0
}

/** Counts by hour for one day's readings. A resent hour replaces the earlier one. */
function byHour(readings) {
  const hours = new Map()
  for (const reading of readings) hours.set(hourOf(reading.at), reading.count)
  return hours
}

function total(hours) {
  let sum = 0
  for (const count of hours.values()) sum += count
  return sum
}

/**
 * One row per day from the first day with a good reading to the last, gaps included:
 * the day's total, how many hours have a count, the busiest hour, and the average daily
 * total over the seven days ending that day (only days with any count are averaged).
 */
export function dailyReport(readings) {
  const valid = readings.filter(isValid)
  if (valid.length === 0) return []
  const days = valid.map((reading) => dayOf(reading.at)).sort()
  const first = days[0]
  const last = days[days.length - 1]
  const rows = []
  for (let day = first; day <= last; day = addDays(day, 1)) {
    const hours = byHour(valid.filter((reading) => dayOf(reading.at) === day))
    let peakHour = null
    let peak = -1
    for (const hour of [...hours.keys()].sort((a, b) => a - b)) {
      if (hours.get(hour) > peak) {
        peak = hours.get(hour)
        peakHour = hour
      }
    }
    const week = []
    for (let back = 0; back < 7; back++) {
      const earlier = addDays(day, -back)
      const counts = byHour(valid.filter((reading) => dayOf(reading.at) === earlier))
      if (counts.size > 0) week.push(total(counts))
    }
    const average = week.length ? week.reduce((sum, n) => sum + n, 0) / week.length : null
    rows.push({
      day,
      total: total(hours),
      hours: hours.size,
      peakHour,
      rolling7: average === null ? null : Math.round(average * 10) / 10,
    })
  }
  return rows
}
