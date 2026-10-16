/** Miles per gallon for each fill after the first: miles since the previous fill over gallons pumped. */
export function perFill(fills) {
  const sorted = [...fills].sort((a, b) => a.odometer - b.odometer)
  const rows = []
  for (let i = 1; i < sorted.length; i++) {
    const miles = sorted[i].odometer - sorted[i - 1].odometer
    rows.push({
      date: sorted[i].date,
      miles,
      gallons: sorted[i].gallons,
      mpg: miles / sorted[i].gallons,
    })
  }
  return rows
}

/** Average miles per gallon per calendar month (YYYY-MM), from the per-fill figures. */
export function monthly(fills) {
  const months = new Map()
  for (const row of perFill(fills)) {
    const month = row.date.slice(0, 7)
    months.set(month, [...(months.get(month) ?? []), row.mpg])
  }
  return [...months].map(([month, values]) => ({
    month,
    mpg: values.reduce((sum, value) => sum + value, 0) / values.length,
  }))
}
