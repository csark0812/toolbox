import { bookings } from './store.mjs'

const forbidden = { status: 403, body: { error: 'not allowed' } }

/** Cancels a booking: staff their own, admins any. */
export function cancelBooking(request, user) {
  const booking = bookings().find((entry) => entry.id === request.params.id)
  if (!booking) return { status: 404, body: { error: 'not found' } }
  if (user.role !== 'admin' && booking.user !== user.id) return forbidden
  return { status: 200, body: { cancelled: booking.id } }
}
