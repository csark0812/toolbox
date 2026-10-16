import { batchAlerts } from './alerts.mjs'
import { abv, formatGravity, formatTemp } from './units.mjs'

/** The time the report is for: BREW_NOW when set, else the clock. */
export const reportTime = () => (process.env.BREW_NOW ? new Date(process.env.BREW_NOW) : new Date())

/** One line per batch with its latest reading. */
export function statusLines(batches, now = reportTime()) {
  return batches.map((batch) => {
    const latest = batch.readings.at(-1)
    const reading = latest
      ? `${formatTemp(latest.tempC)}, SG ${formatGravity(latest.gravity)}, ${abv(batch.originalGravity, latest.gravity)}% ABV`
      : 'no readings'
    const flag = batchAlerts(batch, now).length ? ' !' : ''
    return `${batch.name.padEnd(16)} ${reading}${flag}`
  })
}

/** Every alert, as `name: problem`. */
export function alertLines(batches, now = reportTime()) {
  return batches.flatMap((batch) =>
    batchAlerts(batch, now).map((alert) => `${batch.name}: ${alert}`),
  )
}
