import { readFileSync, writeFileSync } from 'node:fs'
import { daysBetween, monthOf, sortKey, yearOf } from './dates.mjs'

const file = (path) => new URL(`../data/${path}`, import.meta.url)
const load = (path) => JSON.parse(readFileSync(file(path), 'utf8'))

// The current season lives in trips.json and bookings.json; past years are in data/archive/.
export function loadYear(year) {
  const current = { trips: load('trips.json'), bookings: load('bookings.json') }
  if (current.trips.some((trip) => yearOf(trip.date) === year)) return current
  return load(`archive/${year}.json`)
}
export const loadCurrent = () => ({ trips: load('trips.json'), bookings: load('bookings.json') })

export function saveBookings(bookings) {
  writeFileSync(file('bookings.json'), JSON.stringify(bookings, null, 2) + '\n')
}

export const byDate = (a, b) => sortKey(a.date).localeCompare(sortKey(b.date))

export const tripsInMonth = (trips, month) =>
  trips.filter((trip) => monthOf(trip.date) === month).sort(byDate)

export const bookingsFor = (bookings, trip) =>
  bookings
    .filter((booking) => booking.trip === trip.code)
    .sort(
      (a, b) =>
        sortKey(a.bookedOn).localeCompare(sortKey(b.bookedOn)) || a.ref.localeCompare(b.ref),
    )

// Booked less than a week before the trip: Brimble's need the final numbers a week ahead.
export const isLate = (booking, trip) => daysBetween(booking.bookedOn, trip.date) < 7

export const seatsTaken = (bookings, trip) =>
  bookingsFor(bookings, trip).reduce((sum, booking) => sum + booking.seats, 0)

export const pounds = (pence) => `£${(pence / 100).toFixed(2)}`
