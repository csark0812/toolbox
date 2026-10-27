/** A YYYY-MM-DD date moved on by a number of days. */
export function addDays(date, days) {
  const moved = new Date(`${date}T12:00:00Z`)
  moved.setUTCDate(moved.getUTCDate() + days)
  return moved.toISOString().slice(0, 10)
}
