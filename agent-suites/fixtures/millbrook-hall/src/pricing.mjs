import { DAY_RATE, EVENING_RATE, EVENING_STARTS } from './config.mjs'

const minutes = (time) => {
  const [hours, mins] = time.split(':').map(Number)
  return hours * 60 + mins
}

/** Hourly rate for a booking: evening bookings pay the evening rate. */
export function rate(booking) {
  return minutes(booking.start) > minutes(EVENING_STARTS) ? EVENING_RATE : DAY_RATE
}

/** Price in pounds for a booking. */
export function price(booking) {
  return (rate(booking) * (minutes(booking.end) - minutes(booking.start))) / 60
}
