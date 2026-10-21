import { addMonths, daysBetween } from './dates.mjs'

export const WARNING_DAYS = 42

export function parseAttendance(text) {
  const [, ...rows] = text.trim().split('\n')
  return rows.map((row) => {
    const [date, body, councillor, status] = row.split(',')
    return { date, body, councillor, status }
  })
}

/** The last meeting each councillor attended. */
export function lastAttended(records) {
  const last = new Map()
  for (const record of records) {
    if (!last.has(record.councillor)) last.set(record.councillor, null)
    if (record.body !== 'Full Council' || record.status !== 'present') continue
    const seen = last.get(record.councillor)
    if (!seen || record.date > seen) last.set(record.councillor, record.date)
  }
  return last
}

/** Each councillor's position under the six-month rule on a given day. */
export function positions(records, today) {
  return [...lastAttended(records)]
    .map(([councillor, last]) => {
      const runsOut = last ? addMonths(last, 6) : null
      const left = runsOut ? daysBetween(today, runsOut) : -Infinity
      const flag = left <= 0 ? 'LAPSED' : left <= WARNING_DAYS ? 'AT RISK' : ''
      return { councillor, last, runsOut, flag }
    })
    .sort((a, b) => (a.councillor < b.councillor ? -1 : 1))
}
