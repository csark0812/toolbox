/** Minutes after midnight for HH:MM. */
export function minutesOf(time) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}
