/** One slot on the mill: its time, the grower and the weight they're bringing. */
const line = (slot) => `${slot.time}  ${slot.grower}  ${slot.kg} kg`

/** The milling-day schedule: one line per slot, in time order. */
export function schedule(slots) {
  return [...slots].sort((a, b) => a.time.localeCompare(b.time)).map(line)
}
