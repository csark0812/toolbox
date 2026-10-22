import { dayLabel, monthLabel, shortLabel } from '../src/dates.mjs'
import { bookingsFor, isLate, loadYear, seatsTaken, tripsInMonth } from '../src/outings.mjs'

const month = process.argv[2]
if (!/^\d{4}-\d{2}$/.test(month ?? '')) {
  console.error('usage: npm run manifest -- YYYY-MM')
  process.exit(1)
}
const { trips, bookings } = loadYear(Number(month.slice(0, 4)))
console.log(`Trips in ${monthLabel(month)}`)
for (const trip of tripsInMonth(trips, month)) {
  console.log('')
  console.log(`${dayLabel(trip.date)}  ${trip.code}  ${trip.destination}  dep ${trip.departs}`)
  for (const booking of bookingsFor(bookings, trip)) {
    const seats = `${booking.seats} ${booking.seats === 1 ? 'seat ' : 'seats'}`
    const flags = [isLate(booking, trip) ? 'LATE' : '', booking.paid ? '' : 'UNPAID']
      .filter(Boolean)
      .join(' ')
    console.log(
      `  ${booking.ref}  ${booking.name.padEnd(15)}${seats}  booked ${shortLabel(booking.bookedOn).padEnd(7)}${flags}`.trimEnd(),
    )
  }
  console.log(`  ${seatsTaken(bookings, trip)} of ${trip.seats} seats taken`)
}
