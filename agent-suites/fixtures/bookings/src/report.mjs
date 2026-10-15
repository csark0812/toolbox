import { localDay } from './tz.mjs'

/** Booking ids grouped by the studio's local day, days in calendar order. */
export function groupByLocalDay(bookings, timeZone) {
  const days = {}
  for (const booking of bookings) {
    const day = localDay(booking.at, timeZone)
    ;(days[day] ??= []).push(booking.id)
  }
  return Object.fromEntries(Object.entries(days).sort(([a], [b]) => a.localeCompare(b)))
}

/** Share of capacity used, as a whole percent. */
export function utilization(booked, capacity) {
  return Math.round((booked / capacity) * 100)
}
