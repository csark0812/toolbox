const CODE = /^M\d{4}$/g
const COURTS = [1, 2, 3, 4]

/** Why a request cannot be booked, or null when it can. */
export function problemWith(request, members, bookings = []) {
  if (!CODE.test(request.member)) return 'unknown member'
  const member = members.get(request.member)
  if (!member) return 'unknown member'
  if (member.expires < request.date) return 'membership expired'
  if (!COURTS.includes(request.court)) return 'no such court'
  const taken = bookings.some(
    (booking) =>
      booking.court === request.court &&
      booking.date === request.date &&
      booking.hour === request.hour,
  )
  if (taken) return 'court taken'
  return null
}

/** Books each request in order; later requests see the earlier bookings. */
export function importRequests(requests, members) {
  const bookings = []
  const results = []
  for (const request of requests) {
    const problem = problemWith(request, members, bookings)
    if (!problem) bookings.push(request)
    results.push({ request, problem })
  }
  return results
}
