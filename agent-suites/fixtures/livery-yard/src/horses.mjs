import { readFileSync } from 'node:fs'

export const yard = JSON.parse(
  readFileSync(new URL('../config/yard.json', import.meta.url), 'utf8'),
)

export function loadHorses(path = new URL('../data/horses.json', import.meta.url)) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

export const pounds = (pence) => (pence / 100).toFixed(2)
