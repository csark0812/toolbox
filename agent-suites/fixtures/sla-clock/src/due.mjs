import { PRIORITIES } from './priorities.mjs'

/** The due date for a ticket opened on `opened` (YYYY-MM-DD). Counts calendar days for now. */
export function dueDate(opened, priority) {
  const rule = PRIORITIES[priority]
  if (!rule) throw new RangeError(`unknown priority: ${priority}`)
  const date = new Date(`${opened}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + rule.days)
  return date.toISOString().slice(0, 10)
}
