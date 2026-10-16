import { readFileSync } from 'node:fs'

/** One reading from a CSV line; `kwh` is null for a gap. */
function parseReading(line, lineNumber) {
  const fields = line.split(',')
  if (fields.length !== 3) throw new SyntaxError(`bad reading on line ${lineNumber}: ${line}`)
  const [meter, at, kwh] = fields
  return { meter, at, kwh: kwh.trim() === '' ? null : Number(kwh) }
}

/** Totals for one meter's readings in one month. */
function monthRow(meter, month, readings) {
  const present = readings.filter((reading) => reading.kwh !== null)
  const kwh = present.reduce((sum, reading) => sum + reading.kwh, 0)
  const peak = present.reduce(
    (best, reading) => (best === null || reading.kwh > best.kwh ? reading : best),
    null,
  )
  return {
    meter,
    month,
    kwh: Math.round(kwh * 1000) / 1000,
    peakKwh: peak ? peak.kwh : null,
    peakAt: peak ? peak.at : null,
    readings: readings.length,
    gaps: readings.length - present.length,
  }
}

/** Monthly totals per meter from an operator export, sorted by meter then month. */
export async function monthlySummary(file) {
  const lines = readFileSync(file, 'utf8').split(/\r?\n/)
  const readings = lines
    .map((line, index) => ({ line, lineNumber: index + 1 }))
    .slice(1)
    .filter(({ line }) => line.trim() !== '')
    .map(({ line, lineNumber }) => parseReading(line, lineNumber))
  const byMeter = {}
  for (const reading of readings) (byMeter[reading.meter] ??= []).push(reading)
  const rows = []
  for (const meter of Object.keys(byMeter).sort()) {
    const byMonth = {}
    for (const reading of byMeter[meter]) (byMonth[reading.at.slice(0, 7)] ??= []).push(reading)
    for (const month of Object.keys(byMonth).sort())
      rows.push(monthRow(meter, month, byMonth[month]))
  }
  return rows
}
