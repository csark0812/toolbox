// US EPA breakpoints for PM2.5 (24-hour standard, µg/m³) and the index range for each.
const BREAKPOINTS = [
  [0, 9, 0, 50, 'Good'],
  [9.1, 35.4, 51, 100, 'Moderate'],
  [35.5, 55.4, 101, 150, 'Unhealthy for sensitive groups'],
  [55.5, 125.4, 151, 200, 'Unhealthy'],
  [125.5, 225.4, 201, 300, 'Very unhealthy'],
  [225.5, 500, 301, 500, 'Hazardous'],
]

const WINDOW_MINUTES = 120

/** The index and category for a PM2.5 concentration. */
export function aqiFromPm25(concentration) {
  const c = Math.floor(concentration * 10) / 10
  const row = BREAKPOINTS.find(([low, high]) => c >= low && c <= high) ?? BREAKPOINTS.at(-1)
  const [low, high, indexLow, indexHigh, category] = row
  const index = Math.round(
    ((indexHigh - indexLow) / (high - low)) * (Math.min(c, high) - low) + indexLow,
  )
  return { index, category }
}

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = sorted.length >> 1
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

/**
 * The dashboard figure: the median PM2.5 of the readings in the window before `now`, so a single
 * bad reading (a sensor glitch, a burnt slice of toast) does not set off the alarm.
 */
export function currentAqi(readings, now) {
  const from = now.getTime() - WINDOW_MINUTES * 60 * 1000
  const recent = readings.filter((reading) => reading.at.getTime() > from && reading.at <= now)
  if (!recent.length) return null
  const pm25 = median(recent.map((reading) => reading.pm25))
  return { ...aqiFromPm25(pm25), pm25, readings: recent.length }
}

/** The mean PM2.5 over one UTC day, for the weekly email. */
export function dailyAverage(readings, day) {
  const values = readings
    .filter((reading) => reading.at.toISOString().slice(0, 10) === day)
    .map((reading) => reading.pm25)
  if (!values.length) return null
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  return { pm25: Math.round(mean * 10) / 10, readings: values.length, ...aqiFromPm25(mean) }
}
