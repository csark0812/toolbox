/** One line of the bookings list. */
export function bookingLine(booking) {
  return `${booking.id}  ${booking.name.padEnd(14)} ${String(booking.days).padStart(2)}d  ${booking.kit.join(', ')}`
}
