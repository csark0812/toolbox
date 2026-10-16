export const ROOMS = { main: 'Main hall', small: 'Small room' }
export const OPENS = '08:00'
export const CLOSES = '22:00'

export const minutesOf = (time) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/** Why a request cannot be booked at all, or null. */
export function problemWith(request) {
  if (!ROOMS[request.room]) return `no room called ${request.room}`
  if (!/^\d{4}-\d{2}-\d{2}$/.test(request.date)) return `dates are YYYY-MM-DD, got ${request.date}`
  for (const time of [request.start, request.end])
    if (!/^\d{2}:\d{2}$/.test(time)) return `times are HH:MM, got ${time}`
  if (minutesOf(request.start) >= minutesOf(request.end))
    return 'a booking must end after it starts'
  if (minutesOf(request.start) < minutesOf(OPENS) || minutesOf(request.end) > minutesOf(CLOSES))
    return `outside opening hours (${OPENS}-${CLOSES})`
  return null
}

/** The existing booking that clashes with a request, or undefined. */
export function clashWith(bookings, request) {
  return bookings.find(
    (booking) =>
      booking.room === request.room &&
      booking.date === request.date &&
      minutesOf(booking.start) <= minutesOf(request.end) &&
      minutesOf(request.start) <= minutesOf(booking.end),
  )
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** `2026-10-22` as `Thu 22 Oct`. */
export function dayLabel(date) {
  const day = new Date(`${date}T00:00:00Z`)
  return `${DAYS[day.getUTCDay()]} ${day.getUTCDate()} ${MONTHS[day.getUTCMonth()]}`
}

/** The seven dates of the week starting `monday`. */
export function weekOf(monday) {
  const start = new Date(`${monday}T00:00:00Z`)
  return Array.from({ length: 7 }, (_, i) =>
    new Date(start.getTime() + i * 86400000).toISOString().slice(0, 10),
  )
}
