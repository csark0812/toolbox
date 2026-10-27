/** Fees in pence. */
export const OFF_PEAK = 600
export const PEAK = 900
export const WEEKEND = 700
export const JUNIOR = 600
export const PEAK_FROM_HOUR = 17

/** The date (YYYY-MM-DD) and hour a booking starts. */
export function startOf(booking) {
  return { date: booking.start.slice(0, 10), hour: Number(booking.start.slice(11, 13)) }
}

/** The fee for one court booking, in pence. */
export function courtFee(booking) {
  if (booking.players.every((player) => player.junior)) return JUNIOR
  const { date, hour } = startOf(booking)
  const day = new Date(`${date}T12:00:00Z`).getUTCDay()
  if (day === 0 || day === 6) return WEEKEND
  return hour > PEAK_FROM_HOUR ? PEAK : OFF_PEAK
}
