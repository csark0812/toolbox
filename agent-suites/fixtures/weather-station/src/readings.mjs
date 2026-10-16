import { readFileSync } from 'node:fs'
import { toCelsius } from './units.mjs'

const dataFile = (name) => new URL(`../data/${name}`, import.meta.url)

/** Every reading as { station, day, celsius }. */
export function loadReadings() {
  const sensors = new Map(
    JSON.parse(readFileSync(dataFile('sensors.json'), 'utf8')).map((s) => [s.id, s]),
  )
  const [, ...rows] = readFileSync(dataFile('readings.csv'), 'utf8').trim().split('\n')
  return rows.map((row) => {
    const [id, at, value] = row.split(',')
    const sensor = sensors.get(id)
    if (!sensor) throw new Error(`Unknown sensor ${id}`)
    return {
      station: sensor.station,
      day: at.slice(0, 10),
      celsius: toCelsius(Number(value), sensor.unit),
    }
  })
}
