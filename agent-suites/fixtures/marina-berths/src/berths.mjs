import { readFileSync } from 'node:fs'

const RATES = JSON.parse(readFileSync(new URL('../data/rates.json', import.meta.url), 'utf8'))

/** The nightly berth fee in pence for a boat of this length. */
export function fee(boat) {
  if (boat.lengthM <= 8) return RATES.upTo8
  if (boat.lengthM <= 12) return RATES.upTo12
  return RATES.over12
}

export const money = (pence) => `${pence < 0 ? '-' : ''}£${(Math.abs(pence) / 100).toFixed(2)}`
