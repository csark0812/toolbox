import { bookings, pitches, saveBooking } from './store.mjs'

const DAY = 24 * 60 * 60 * 1000
const nights = (arrive, depart) => (Date.parse(depart) - Date.parse(arrive)) / DAY
const overlaps = (a, b) => a.arrive < b.depart && b.arrive < a.depart

/** Lists every pitch with its nightly price. */
export function listPitches(request, session) {
  if (!session) return { status: 401, body: { error: 'sign in' } }
  return { status: 200, body: pitches() }
}

/** Lists the signed-in guest's bookings. */
export function myBookings(request, session) {
  if (!session?.guestId) return { status: 401, body: { error: 'sign in' } }
  return { status: 200, body: bookings().filter((entry) => entry.guestId === session.guestId) }
}

/** Books a pitch for the signed-in guest. */
export function bookPitch(request, session) {
  if (!session?.guestId) return { status: 401, body: { error: 'sign in' } }
  const pitch = pitches().find((entry) => entry.id === request.params.id)
  if (!pitch) return { status: 404, body: { error: 'not found' } }
  const { arrive, depart } = request.body
  if (!(arrive < depart) || arrive < request.today) return { status: 400, body: { error: 'dates' } }
  const taken = bookings().some(
    (entry) =>
      entry.pitchId === pitch.id &&
      entry.status === 'booked' &&
      overlaps(entry, { arrive, depart }),
  )
  if (taken) return { status: 409, body: { error: 'pitch taken' } }
  const totalPence = nights(arrive, depart) * pitch.nightlyPence
  const booking = {
    id: `bk-${bookings().length + 1}`,
    guestId: session.guestId,
    pitchId: pitch.id,
    arrive,
    depart,
    totalPence,
    depositPence: Math.floor(totalPence / 5),
    paidPence: 0,
    status: 'booked',
  }
  saveBooking(booking)
  return { status: 201, body: booking }
}
