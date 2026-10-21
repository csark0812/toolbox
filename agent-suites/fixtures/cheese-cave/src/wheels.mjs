import { readFileSync } from 'node:fs'

export const AGEING_DAYS = { Tomme: 90, Cheddar: 270, Blue: 60, Washed: 45 }

const DAY = 24 * 60 * 60 * 1000

export function loadWheels(path = 'data/wheels.json') {
  return JSON.parse(readFileSync(path, 'utf8'))
}

export function daysInCave(wheel, today) {
  return Math.floor((Date.parse(today) - Date.parse(wheel.made)) / DAY)
}

export function isReady(wheel, today) {
  return daysInCave(wheel, today) >= AGEING_DAYS[wheel.cheese]
}
