import { readFileSync } from 'node:fs'

/** Subscriptions keyed by customer, with delivery dates as UTC-midnight Dates. */
export function loadStore(path = new URL('../data/subscriptions.json', import.meta.url)) {
  const rows = JSON.parse(readFileSync(path, 'utf8'))
  return new Map(
    rows.map((row) => [
      row.customerId,
      { ...row, nextDelivery: new Date(`${row.nextDelivery}T00:00:00Z`) },
    ]),
  )
}

export const isoDay = (date) => date.toISOString().slice(0, 10)

/** A date some weeks later, as a new Date. */
export const weeksAfter = (date, weeks) => new Date(date.getTime() + weeks * 7 * 86400000)
