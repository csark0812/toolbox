// Skips, councils, permits and quotes.

export const SIZES = {
  mini: { yards: 2, weeklyPence: 9500 },
  midi: { yards: 4, weeklyPence: 14500 },
  builders: { yards: 6, weeklyPence: 19500 },
  maxi: { yards: 8, weeklyPence: 24500 },
}

const COUNCIL_BY_DISTRICT = {
  BS1: 'Bristol',
  BS3: 'Bristol',
  BS6: 'Bristol',
  BS16: 'South Gloucestershire',
  BS36: 'South Gloucestershire',
  BS21: 'North Somerset',
  BS48: 'North Somerset',
}

export function councilFor(postcode) {
  const district = postcode.trim().toUpperCase().split(/\s+/)[0]
  return COUNCIL_BY_DISTRICT[district] ?? null
}

export function hireFee(booking) {
  const size = SIZES[booking.size]
  if (!size) throw new Error(`No such skip size: ${booking.size}`)
  return size.weeklyPence * booking.weeks
}

// Free inside Bristol, a flat charge elsewhere in the area.
export function deliveryFee(booking) {
  const council = councilFor(booking.postcode)
  if (council === null) throw new Error(`We don't deliver to ${booking.postcode}`)
  return council === 'Bristol' ? 0 : 2500
}

// Permit fee and the longest a permit runs, per council.
export const PERMIT_FEES = {
  Bristol: { pence: 4500, days: 14 },
  'South Gloucestershire': { pence: 3800, days: 28 },
  'North Somerset': { pence: 5200, days: 21 },
}

export function needsPermit(booking) {
  return booking.placement === 'road'
}

export function permitFee(booking) {
  if (!needsPermit(booking)) return 0
  return PERMIT_FEES[councilFor(booking.postcode)].pence
}

const addDays = (iso, days) => {
  const date = new Date(`${iso}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

// A permit covers the hire, up to the council's limit; the skip has to be renewed or moved after that.
export function permitEnd(booking) {
  const { days } = PERMIT_FEES[councilFor(booking.postcode)]
  return addDays(booking.start, Math.min(booking.weeks * 7, days))
}

export function expiringPermits(bookings, today, withinDays = 2) {
  const horizon = addDays(today, withinDays)
  return bookings
    .filter((booking) => needsPermit(booking))
    .map((booking) => ({ booking, ends: permitEnd(booking) }))
    .filter(({ ends }) => ends >= today && ends <= horizon)
}

export function permitApplication(booking) {
  const council = councilFor(booking.postcode)
  return [
    `To: ${council} Council, Highways`,
    `Skip permit for ${booking.address}, ${booking.postcode}`,
    `${SIZES[booking.size].yards}-yard skip from ${booking.start} to ${permitEnd(booking)} (${booking.ref})`,
    `Fee enclosed: £${(PERMIT_FEES[council].pence / 100).toFixed(2)}`,
  ].join('\n')
}

export function quoteTotal(booking) {
  return hireFee(booking) + deliveryFee(booking) + permitFee(booking)
}
