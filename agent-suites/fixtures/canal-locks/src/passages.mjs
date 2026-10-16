const toMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/** How many minutes a boat spent in the lock. */
export const minutesInLock = (passage) => toMinutes(passage.out) - toMinutes(passage.in)

/** One log line for a passage. */
export function passageLine(passage) {
  return `${passage.date}  Lock ${passage.lock}  ${passage.boat.padEnd(14)}${passage.in}-${passage.out}  ${String(minutesInLock(passage)).padStart(3)} min`
}
