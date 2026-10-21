const STEP = 15 * 60 * 1000
const time = (at) => new Date(`${at}Z`)

/** Alert periods for every gauge, by start time then gauge. */
export function alertPeriods(readings, thresholds) {
  const gauges = [...new Set(readings.map((reading) => reading.gauge))]
  const periods = []
  for (const gauge of gauges) {
    const mine = readings
      .filter((reading) => reading.gauge === gauge && reading.level !== null)
      .sort((a, b) => time(a.at) - time(b.at))
    let open = null
    mine.forEach((reading, i) => {
      const window = mine.filter((_, j) => j > i - 4 && j <= i)
      const unbroken =
        window.length === 4 &&
        window.every((entry, k) => k === 0 || time(entry.at) - time(window[k - 1].at) === STEP)
      const mean = window.reduce((sum, entry) => sum + entry.level, 0) / window.length
      if (unbroken && mean > thresholds[gauge]) {
        if (open && time(reading.at) - time(open.to) === STEP) {
          open.to = reading.at
          open.peak = Math.max(open.peak, reading.level)
          open.readings++
        } else {
          open = { gauge, from: reading.at, to: reading.at, peak: reading.level, readings: 1 }
          periods.push(open)
        }
      } else open = null
    })
  }
  return periods.sort(
    (a, b) => (a.from < b.from ? -1 : a.from > b.from ? 1 : 0) || (a.gauge < b.gauge ? -1 : 1),
  )
}
