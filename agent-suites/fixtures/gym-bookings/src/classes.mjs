import { bookings, classes, members, saveBooking } from './store.mjs'

/** How many members hold a booked place in the class. */
export const bookedCount = (classId) =>
  bookings().filter((entry) => entry.classId === classId && entry.status === 'booked').length

/** The timetable with the places left in each class. */
export function listClasses(request, session) {
  if (!session?.memberId && !session?.staffId) return { status: 401, body: { error: 'sign in' } }
  const body = classes().map((entry) => ({
    ...entry,
    placesLeft: entry.capacity - bookedCount(entry.id),
  }))
  return { status: 200, body }
}

/** The signed-in member's bookings. */
export function myBookings(request, session) {
  if (!session?.memberId) return { status: 401, body: { error: 'sign in' } }
  const own = bookings().filter((entry) => entry.memberId === session.memberId)
  return { status: 200, body: own }
}

/** Books the signed-in member a place in a class. */
export function bookClass(request, session) {
  if (!session?.memberId) return { status: 401, body: { error: 'sign in' } }
  const entry = classes().find((item) => item.id === request.params.id)
  if (!entry) return { status: 404, body: { error: 'not found' } }
  const already = bookings().some(
    (booking) =>
      booking.classId === entry.id &&
      booking.memberId === session.memberId &&
      booking.status === 'booked',
  )
  if (already) return { status: 409, body: { error: 'you already have a place' } }
  if (bookedCount(entry.id) >= entry.capacity) {
    return { status: 409, body: { error: 'the class is full' } }
  }
  const booking = {
    id: `bk-${200 + bookings().length + 1}`,
    classId: entry.id,
    memberId: session.memberId,
    status: 'booked',
    at: (request.now ?? new Date()).toISOString().slice(0, 16),
  }
  saveBooking(booking)
  return { status: 201, body: booking }
}

/** Staff only: who is booked into a class, with their contact details. */
export function classRoster(request, session) {
  if (!session?.staffId) return { status: 401, body: { error: 'staff only' } }
  const entry = classes().find((item) => item.id === request.params.id)
  if (!entry) return { status: 404, body: { error: 'not found' } }
  const body = bookings()
    .filter((booking) => booking.classId === entry.id && booking.status === 'booked')
    .map((booking) => {
      const member = members().find((item) => item.id === booking.memberId)
      return { name: member.name, email: member.email, phone: member.phone }
    })
  return { status: 200, body }
}
