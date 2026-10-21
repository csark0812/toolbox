import { PENCE_PER_HALF_HOUR } from './config.mjs'

/** Half hours charged for a walk. */
export const halfHours = (minutes) => Math.round(minutes / 30)

export const money = (pence) => `£${(pence / 100).toFixed(2)}`

/** Invoice lines for one dog, in date order, and the total in pence. */
export function invoice(walks, dog) {
  const lines = walks
    .filter((walk) => walk.dog === dog)
    .map((walk) => {
      const units = halfHours(walk.minutes)
      return { ...walk, units, pence: units * PENCE_PER_HALF_HOUR }
    })
  return { lines, total: lines.reduce((sum, line) => sum + line.pence, 0) }
}
