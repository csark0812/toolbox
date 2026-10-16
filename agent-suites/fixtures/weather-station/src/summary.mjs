const DAY = 86400000

/** Every day from `from` to `to`, inclusive, as YYYY-MM-DD. */
export function daysBetween(from, to) {
  const days = []
  for (let t = Date.parse(from); t <= Date.parse(to); t += DAY)
    days.push(new Date(t).toISOString().slice(0, 10))
  return days
}

/** Min, max and mean °C for each day. */
export function dailySummary(readings, days) {
  return days.map((day) => {
    const values = readings.filter((r) => r.day === day).map((r) => r.celsius)
    return {
      day,
      min: Math.min(...values),
      max: Math.max(...values),
      mean: values.reduce((a, b) => a + b, 0) / values.length,
    }
  })
}

export function formatDay({ day, min, max, mean }) {
  return `${day}  min ${min.toFixed(1)}  max ${max.toFixed(1)}  mean ${mean.toFixed(1)}`
}
