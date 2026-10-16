/** ISO week label for a YYYY-MM-DD date, like `2026-W38`. */
export function isoWeek(date) {
  const day = new Date(`${date}T00:00:00Z`)
  const weekday = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'UTC' }).format(
    day,
  )
  const index = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(weekday)
  const thursday = new Date(day.getTime() + (3 - index) * 86400000)
  const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((thursday - yearStart) / 86400000 + 1) / 7)
  return `${thursday.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}
