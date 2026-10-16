import { readFileSync } from 'node:fs'

/** A room's readings, oldest first: `{ at: Date, pm25 }`. */
export function loadReadings(file) {
  const [, ...lines] = readFileSync(file, 'utf8').trim().split('\n')
  return lines.map((line) => {
    const [time, pm25] = line.split(',')
    return { at: new Date(time), pm25: Number(pm25) }
  })
}
