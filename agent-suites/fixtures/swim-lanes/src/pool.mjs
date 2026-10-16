export const LANES = [1, 2, 3, 4]
export const HOURS = [6, 7, 8]

/** Lane bookings for the pool. Free slots are cached per day because the desk screen asks often. */
export function createPool() {
  const bookings = new Map()
  const cache = new Map()

  function free(day) {
    if (cache.has(day)) return cache.get(day)
    const taken = new Set(
      [...bookings.values()].filter((b) => b.day === day).map((b) => `${b.lane}@${b.hour}`),
    )
    const result = LANES.map((lane) => ({
      lane,
      hours: HOURS.filter((hour) => !taken.has(`${lane}@${hour}`)),
    }))
    cache.set(day, result)
    return result
  }

  function book({ id, club, lane, day, hour }) {
    if (!LANES.includes(lane) || !HOURS.includes(hour)) return { ok: false, reason: 'no such slot' }
    if (bookings.has(id)) return { ok: false, reason: 'duplicate id' }
    const open = free(day).find((entry) => entry.lane === lane)
    if (!open.hours.includes(hour)) return { ok: false, reason: 'taken' }
    bookings.set(id, { id, club, lane, day, hour })
    cache.delete(day)
    free(day) // warm the cache: the desk screen refreshes straight after a booking
    return { ok: true }
  }

  function cancel(id) {
    const booking = bookings.get(id)
    if (!booking) return false
    bookings.delete(id)
    cache.delete(booking.date)
    return true
  }

  return { book, cancel, free, bookings: () => [...bookings.values()] }
}
