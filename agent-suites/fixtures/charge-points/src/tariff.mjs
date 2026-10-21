import { minutesOf } from './clock.mjs'

export const PEAK = { from: '16:00', to: '19:00', pence: 45 }
export const OFF_PEAK_PENCE = 28
export const GRACE_MINUTES = 30
export const OVERSTAY_BLOCK_MINUTES = 10
export const OVERSTAY_BLOCK_PENCE = 50

/** Pence per kWh at a time of day. */
export function rateAt(time) {
  const minutes = minutesOf(time)
  return minutes >= minutesOf(PEAK.from) && minutes < minutesOf(PEAK.to)
    ? PEAK.pence
    : OFF_PEAK_PENCE
}
