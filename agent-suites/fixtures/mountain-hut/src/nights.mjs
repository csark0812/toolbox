import { addDays, daysOfMonth } from './dates.mjs'

export const BUNKS = 20

export function parseBookings(text) {
  const [, ...rows] = text.trim().split('\n')
  return rows.map((row) => {
    const [ref, name, arrive, nights, guests, status] = row.split(',')
    return { ref, name, arrive, nights: Number(nights), guests: Number(guests), status }
  })
}

/** The nights a booking keeps bunks taken. */
export function nightsOf(booking) {
  const nights = []
  for (let i = 0; i <= booking.nights; i++) nights.push(addDays(booking.arrive, i))
  return nights
}

/** Bunks taken on each night of a month. */
export function monthNights(bookings, month) {
  const taken = new Map(daysOfMonth(month).map((day) => [day, 0]))
  for (const booking of bookings) {
    if (booking.status !== 'confirmed') continue
    for (const night of nightsOf(booking)) {
      if (taken.has(night)) taken.set(night, taken.get(night) + booking.guests)
    }
  }
  return [...taken].map(([night, guests]) => ({ night, guests, over: guests > BUNKS }))
}
