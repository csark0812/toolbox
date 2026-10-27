import { minutesOf } from './clock.mjs'
import { GRACE_MINUTES, OVERSTAY_BLOCK_MINUTES, OVERSTAY_BLOCK_PENCE, rateAt } from './tariff.mjs'

const rowsOf = (text) =>
  text
    .trim()
    .split('\n')
    .slice(1)
    .map((row) => row.split(','))

export function parseSessions(text) {
  return rowsOf(text).map(([id, driver, bay, date, plugIn, chargeEnd, unplug]) => ({
    id,
    driver,
    bay,
    date,
    plugIn,
    chargeEnd,
    unplug,
  }))
}

export function parseReadings(text) {
  return rowsOf(text).map(([session, time, kwh]) => ({ session, time, kwh: Number(kwh) }))
}

/** Overstay fee in pence: 50p per started 10 minutes after the grace period. */
export function overstayPence(session) {
  const over = minutesOf(session.unplug) - minutesOf(session.chargeEnd) - GRACE_MINUTES
  return over > 0 ? Math.ceil(over / OVERSTAY_BLOCK_MINUTES) * OVERSTAY_BLOCK_PENCE : 0
}

/** A session's bill in pence. */
export function bill(session, readings) {
  const own = readings
    .filter((reading) => reading.session === session.id)
    .sort((a, b) => minutesOf(a.time) - minutesOf(b.time))
  const kwh = own.length ? own.at(-1).kwh - own[0].kwh : 0
  const energy = Math.round(kwh * rateAt(session.plugIn))
  const overstay = overstayPence(session)
  return { kwh, energy, overstay, total: energy + overstay }
}
