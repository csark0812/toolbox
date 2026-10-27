/** Nightly telescope charges in pence, by member type. */
export const RATES = {
  adult: { member: 600, visitor: 1400 },
  junior: { member: 300, visitor: 700 },
}

/** Parse a CSV export into records. */
export function parseCsv(text) {
  const [header, ...rows] = text.trim().split('\n')
  const keys = header.split(',')
  return rows.map((row) => Object.fromEntries(row.split(',').map((v, i) => [keys[i], v.trim()])))
}

/** True when `member` holds a current membership on `date` (both YYYY-MM-DD). */
export function isMember(member, date) {
  return Boolean(member) && date < member.expires
}

/** What one booking is charged, in pence. Cancelled bookings are not charged. */
export function chargeFor(booking, membersByName) {
  if (booking.status === 'cancelled') return 0
  const member = membersByName.get(booking.name)
  const rates = RATES[member?.type ?? 'adult']
  return isMember(member, booking.date) ? rates.member : rates.visitor
}

/** Total charged across every booking, in pence. */
export function seasonCharges(bookings, members) {
  const byName = new Map(members.map((m) => [m.name, m]))
  return bookings.reduce((sum, b) => sum + chargeFor(b, byName), 0)
}
