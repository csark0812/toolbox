/** Minutes after midnight for HH:MM. */
export function minutesOf(time) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/** Minutes from start to end, past midnight if the end is earlier. */
export function spanMinutes(start, end) {
  const span = minutesOf(end) - minutesOf(start)
  return span < 0 ? span + 24 * 60 : span
}
