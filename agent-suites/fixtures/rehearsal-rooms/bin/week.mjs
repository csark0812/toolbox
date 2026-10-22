import {
  chargePence,
  isCancelled,
  loadBookings,
  loadClosures,
  loadRooms,
  pounds,
} from '../src/charges.mjs'

const monday = process.argv[2]
if (!/^\d{4}-\d{2}-\d{2}$/.test(monday ?? '')) {
  console.error('usage: npm run week -- YYYY-MM-DD (the Monday)')
  process.exit(1)
}
const rooms = Object.fromEntries(loadRooms().map((room) => [room.id, room]))
const closures = Object.fromEntries(loadClosures().map((day) => [day.date, day.reason]))
const bookings = loadBookings().filter((booking) => !isCancelled(booking))

const label = (date) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  })

let total = 0
console.log(`Week of ${monday}`)
for (let i = 0; i < 7; i++) {
  const day = new Date(`${monday}T00:00:00Z`)
  day.setUTCDate(day.getUTCDate() + i)
  const date = day.toISOString().slice(0, 10)
  const today = bookings
    .filter((booking) => booking.date === date)
    .sort((a, b) => a.start.localeCompare(b.start) || a.room.localeCompare(b.room))
  console.log(`${label(date)}${closures[date] ? `  CLOSED (${closures[date]})` : ''}`)
  for (const booking of today) {
    const pence = chargePence(booking, rooms[booking.room])
    total += pence
    const warning = closures[date] ? '  !! booked on a closed day' : ''
    console.log(
      `  ${booking.start}-${booking.end}  Room ${booking.room}  ${booking.band.padEnd(16)}${pounds(pence)}${warning}`,
    )
  }
}
console.log(`Total ${pounds(total)}`)
