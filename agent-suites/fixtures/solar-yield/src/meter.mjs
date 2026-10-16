import { readFileSync } from 'node:fs'

/** The logger's readings, oldest first: [{ date, kwh }]. */
export function readMeter(file = new URL('../data/meter.csv', import.meta.url)) {
  const [, ...rows] = readFileSync(file, 'utf8').trim().split('\n')
  return rows
    .map((row) => {
      const [date, , kwh] = row.split(',')
      return { date, kwh: Number(kwh) }
    })
    .sort((a, b) => a.date.localeCompare(b.date))
}
