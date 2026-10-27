import { readFileSync } from 'node:fs'
import { dailyReport } from '../src/report.mjs'

const readings = JSON.parse(readFileSync(new URL('../data/counts.json', import.meta.url), 'utf8'))
for (const row of dailyReport(readings)) {
  const peak = row.peakHour === null ? '  -  ' : `${String(row.peakHour).padStart(2, '0')}:00`
  const rolling = row.rolling7 === null ? '-' : row.rolling7.toFixed(1)
  console.log(
    `${row.day}  ${String(row.total).padStart(5)}  ${String(row.hours).padStart(2)}h  peak ${peak}  7-day ${rolling}`,
  )
}
