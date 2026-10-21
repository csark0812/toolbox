import { addYear, daysBetween, fromIso, fromSheet } from './dates.mjs'

export const SOON_DAYS = 30

const rows = (text) =>
  text
    .trim()
    .split('\n')
    .slice(1)
    .map((row) => row.split(','))

/** Every inspection, from the yard's lifts and the divers' sheets. */
export function parseInspections(liftsText, divesText) {
  const lifts = rows(liftsText).map(([mooring, date]) => ({
    mooring,
    kind: 'lift',
    time: fromIso(date),
  }))
  const dives = rows(divesText).map(([mooring, date]) => ({
    mooring,
    kind: 'dive',
    time: fromSheet(date),
  }))
  return [...lifts, ...dives]
}

/** Each mooring's last inspection, due date and status on a day. */
export function mooringStatus(moorings, inspections, today) {
  const now = fromIso(today)
  return moorings.map((mooring) => {
    const times = inspections.filter((row) => row.mooring === mooring).map((row) => row.time)
    if (times.length === 0) return { mooring, last: null, due: null, status: 'OVERDUE' }
    const last = Math.max(...times)
    const due = addYear(last)
    const left = daysBetween(now, due)
    const status = left < 0 ? 'OVERDUE' : left <= SOON_DAYS ? 'DUE SOON' : 'OK'
    return { mooring, last, due, status }
  })
}
