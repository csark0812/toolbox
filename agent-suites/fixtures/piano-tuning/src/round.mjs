const DAY = 86400000

/** Whole days from one ISO date to another. */
const daysBetween = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / DAY)

/** The pianos due a tuning on this day: 182 days or more since the last one. */
export function dueRound(pianos, today) {
  return pianos
    .filter((piano) => daysBetween(piano.lastTuned, today) >= 182)
    .map((piano) => `${piano.client}  ${piano.piano}`)
}
