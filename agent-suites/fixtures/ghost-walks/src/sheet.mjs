import { readFileSync } from 'node:fs'

export const load = (name) => JSON.parse(readFileSync(`data/${name}.json`, 'utf8'))

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function heading(walk) {
  const day = new Date(`${walk.date}T12:00:00Z`)
  const date = `${DAYS[day.getUTCDay()]} ${day.getUTCDate()} ${MONTHS[day.getUTCMonth()]}`
  return `${date}  ${walk.title}  (guide: ${walk.guide})`
}

export const bookingLine = (booking) => `  ${booking.ref}  ${booking.name} x${booking.people}`

export function walkSheet(walk, bookings) {
  const mine = bookings.filter((booking) => booking.walk === walk.id)
  return [heading(walk), ...mine.map(bookingLine)]
}
