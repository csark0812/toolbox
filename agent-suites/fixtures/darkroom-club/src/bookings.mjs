import { STEWARD } from './config.mjs'

const minutes = (time) => {
  const [hours, mins] = time.split(':').map(Number)
  return hours * 60 + mins
}

/** True when two bookings on the same day use the darkroom at the same time. */
export function clashes(a, b) {
  if (a.day !== b.day) return false
  return minutes(a.start) <= minutes(b.end) && minutes(b.start) <= minutes(a.end)
}

export function bookingLine(booking) {
  return `${booking.day} ${booking.start}-${booking.end}  ${booking.member}`
}

/** Every booking with the members it clashes with. */
export function rota(bookings) {
  return bookings.map((booking) => ({
    booking,
    clashesWith: bookings
      .filter((other) => other !== booking && clashes(booking, other))
      .map((other) => other.member),
  }))
}

export function footer() {
  return `Questions: ${STEWARD}`
}
