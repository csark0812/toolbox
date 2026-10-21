import { clock, earliestFirst, minutes } from './times.mjs'

/** Give each waiting person, in queue order, the canoe that comes back first. */
export function assign(returns, waiting) {
  const canoes = earliestFirst(returns)
  return waiting.map((person, index) => {
    const canoe = canoes[index]
    if (!canoe) return { name: person.name, canoe: null, wait: null }
    const start = Math.max(minutes(person.arrived), minutes(canoe.back))
    return {
      name: person.name,
      canoe: canoe.canoe,
      at: clock(start),
      wait: start - minutes(person.arrived),
    }
  })
}

/** The next canoe due back, for the board by the door. */
export function nextDue(returns) {
  return earliestFirst(returns)[0] ?? null
}
