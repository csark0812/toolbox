// Odds and ends for kiln programs.

/** Minutes to ramp from `from` to a segment's target at its rate (°C per hour), rounded up. */
export function calcRamp(segment, from) {
  return Math.ceil((Math.abs(segment.to - from) * 60) / segment.rate)
}

/** Minutes a hold segment lasts. */
export function calcHold(segment) {
  return segment.minutes
}

/** Minutes as `7h 05m`. */
export function fmtMinutes(minutes) {
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`
}
