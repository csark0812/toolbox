/** Minutes after midnight for a dock time such as `9:05`. */
export function minutes(time) {
  const [hours, mins] = time.split(':').map(Number)
  return hours * 60 + mins
}

/** A dock time for minutes after midnight. */
export function clock(total) {
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

/** Canoes in the order they come back, earliest first. */
export function earliestFirst(returns) {
  return [...returns].sort((a, b) => (a.back < b.back ? -1 : a.back > b.back ? 1 : 0))
}
