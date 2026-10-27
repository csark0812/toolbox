import { today } from '../src/dates.mjs'
import { loadCurrent, saveBookings } from '../src/outings.mjs'

const [code, name, seats = '1'] = process.argv.slice(2)
const { trips, bookings } = loadCurrent()
if (!trips.some((trip) => trip.code === code) || !name) {
  console.error('usage: npm run book -- <trip code> "<name>" [seats]')
  process.exit(1)
}
const last = Math.max(...bookings.map((booking) => Number(booking.ref.slice(2))))
const booking = {
  ref: `B-${String(last + 1).padStart(4, '0')}`,
  trip: code,
  name,
  seats: Number(seats),
  bookedOn: today(),
  paid: false,
}
saveBookings([...bookings, booking])
console.log(`Booked ${booking.ref}: ${name}, ${booking.seats} on ${code}`)
