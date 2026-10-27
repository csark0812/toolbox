const DEFAULTS = { slotMinutes: 60, taken: [] }

/** One night's requests in arrival order: the first request for a slot gets it. */
export function scheduleNight(requests, options = DEFAULTS) {
  const results = []
  for (const request of requests) {
    if (options.taken.includes(request.slot)) {
      results.push({ ...request, status: 'slot taken' })
    } else {
      options.taken.push(request.slot)
      results.push({ ...request, status: 'booked' })
    }
  }
  return results
}

/** The end of a slot, as HH:MM. */
export function slotEnd(slot, minutes = DEFAULTS.slotMinutes) {
  const [hours, mins] = slot.split(':').map(Number)
  const end = (hours * 60 + mins + minutes) % (24 * 60)
  return `${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`
}
