import { brimbleDate } from '../src/dates.mjs'
import { byDate, loadCurrent, seatsTaken } from '../src/outings.mjs'

// The CSV Brimble's Coaches import into their booking system. Don't change its format.
const { trips, bookings } = loadCurrent()
console.log('trip_ref,travel_date,depart_time,destination,passengers')
for (const trip of [...trips].sort(byDate))
  console.log(
    [
      trip.code,
      brimbleDate(trip.date),
      trip.departs,
      trip.destination,
      seatsTaken(bookings, trip),
    ].join(','),
  )
