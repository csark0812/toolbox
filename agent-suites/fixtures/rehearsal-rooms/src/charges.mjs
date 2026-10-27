import { readFileSync } from 'node:fs'

const load = (name) =>
  JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url), 'utf8'))
export const loadRooms = () => load('rooms')
export const loadBookings = () => load('bookings')
export const loadClosures = () => load('closures')

export const EVENING_FROM = '18:00'
export const AMP_PENCE = 400

const minutes = (time) => {
  const [hours, mins] = time.split(':').map(Number)
  return hours * 60 + mins
}

export const isCancelled = (booking) => Boolean(booking.cancelledAt)

// What a session costs: the room by the minute at its rate, plus the amp if it was hired.
export function chargePence(booking, room) {
  const length = minutes(booking.end) - minutes(booking.start)
  const rate = minutes(booking.start) >= minutes(EVENING_FROM) ? room.eveningPence : room.dayPence
  const roomPence = Math.round((length * rate) / 60)
  return roomPence + (booking.amp ? AMP_PENCE : 0)
}

export function owed(bookings, rooms) {
  const byId = Object.fromEntries(rooms.map((room) => [room.id, room]))
  return bookings
    .filter((booking) => !booking.paid)
    .map((booking) => ({ ...booking, pence: chargePence(booking, byId[booking.room]) }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start))
}

export const pounds = (pence) => `£${(pence / 100).toFixed(2)}`
