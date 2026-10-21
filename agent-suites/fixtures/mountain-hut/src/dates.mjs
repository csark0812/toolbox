/** The ISO date `days` after an ISO date. */
export function addDays(date, days) {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10)
}

/** Every ISO date in a month such as 2026-08. */
export function daysOfMonth(month) {
  const days = []
  for (let date = `${month}-01`; date.startsWith(month); date = addDays(date, 1)) days.push(date)
  return days
}
