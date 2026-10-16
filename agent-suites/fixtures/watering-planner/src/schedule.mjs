const DAY_MS = 24 * 60 * 60 * 1000

/** A `YYYY-MM-DD` date as a Date at midnight UTC. */
export function parseDate(text) {
  const date = new Date(`${text}T00:00:00Z`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(date.getTime()))
    throw new RangeError(`not a date: ${text}`)
  return date
}

export const formatDate = (date) => date.toISOString().slice(0, 10)

/** The same instant `count` months later. */
export function addMonths(date, count) {
  const next = new Date(date.getTime())
  next.setUTCMonth(next.getUTCMonth() + count)
  return next
}

/** The date after `date` on a task's rhythm. */
function nextDate(date, every) {
  if (every.unit === 'day') return new Date(date.getTime() + every.count * DAY_MS)
  if (every.unit === 'month') return addMonths(date, every.count)
  throw new RangeError(`unknown unit: ${every.unit}`)
}

/** Every date a task falls on from `start` (inclusive) up to `end` (exclusive), as `YYYY-MM-DD`. */
export function occurrences(task, start, end) {
  const dates = []
  for (let at = parseDate(task.from); at < end; at = nextDate(at, task.every))
    if (at >= start) dates.push(formatDate(at))
  return dates
}

/** Every task due for `months` months from `start`, sorted by date, then plant, then task. */
export function plan(plants, startText, months) {
  const start = parseDate(startText)
  const end = addMonths(start, months)
  const rows = []
  for (const plant of plants)
    for (const task of plant.tasks)
      for (const date of occurrences(task, start, end))
        rows.push({ date, plant: plant.name, kind: task.kind })
  return rows.sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      a.plant.localeCompare(b.plant) ||
      a.kind.localeCompare(b.kind),
  )
}
