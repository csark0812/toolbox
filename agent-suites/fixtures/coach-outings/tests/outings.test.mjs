import assert from 'node:assert/strict'
import { test } from 'node:test'
import { brimbleDate, dayLabel, daysBetween } from '../src/dates.mjs'
import { isLate, seatsTaken, tripsInMonth } from '../src/outings.mjs'

const trip = {
  code: 'T-1',
  destination: 'Somewhere',
  date: '07/11/2026',
  departs: '08:00',
  seats: 49,
  farePence: 2000,
}

test('day labels', () => {
  assert.equal(dayLabel(trip.date), 'Sat 07 Nov 2026')
})

test('days between two dates', () => {
  assert.equal(daysBetween('31/10/2026', '07/11/2026'), 7)
})

test('a booking a week or more ahead is not late', () => {
  assert.equal(isLate({ bookedOn: '31/10/2026' }, trip), false)
  assert.equal(isLate({ bookedOn: '01/11/2026' }, trip), true)
})

test('trips in a month are in date order', () => {
  const trips = [
    { ...trip, code: 'T-2', date: '21/11/2026' },
    trip,
    { ...trip, code: 'T-3', date: '01/12/2026' },
  ]
  assert.deepEqual(
    tripsInMonth(trips, '2026-11').map((t) => t.code),
    ['T-1', 'T-2'],
  )
})

test('seats are added up across bookings', () => {
  const bookings = [
    { ref: 'B-1', trip: 'T-1', seats: 2, bookedOn: '01/10/2026' },
    { ref: 'B-2', trip: 'T-1', seats: 3, bookedOn: '02/10/2026' },
    { ref: 'B-3', trip: 'T-9', seats: 5, bookedOn: '02/10/2026' },
  ]
  assert.equal(seatsTaken(bookings, trip), 5)
})

test('the coach company always gets two-digit days and months', () => {
  assert.equal(brimbleDate('7/11/2026'), '07/11/2026')
  assert.equal(brimbleDate('21.11.2026'), '21/11/2026')
})
