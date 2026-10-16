/** Throw for a stop id that is not on the map. */
function requireStop(network, id) {
  if (!network.stops.some((stop) => stop.id === id)) throw new RangeError(`unknown stop: ${id}`)
}

/**
 * The quickest route between two stops (Dijkstra over the directed links), as
 * `{ minutes, stops }`, or null when `to` cannot be reached from `from`.
 */
export function fastestRoute(network, from, to) {
  requireStop(network, from)
  requireStop(network, to)
  // Work on a private copy so a caller's network is never touched.
  const graph = structuredClone(network)
  const best = { [from]: 0 }
  const previous = {}
  const visited = []
  const queue = [{ stop: from, minutes: 0 }]
  while (queue.length > 0) {
    queue.sort((a, b) => a.minutes - b.minutes)
    const { stop, minutes } = queue.shift()
    if (visited.includes(stop)) continue
    visited.push(stop)
    if (stop === to) break
    for (const link of graph.links.filter((each) => each.from === stop)) {
      const arrival = minutes + link.minutes
      if (best[link.to] === undefined || arrival < best[link.to]) {
        best[link.to] = arrival
        previous[link.to] = stop
        queue.push({ stop: link.to, minutes: arrival })
      }
    }
  }
  if (best[to] === undefined) return null
  const stops = [to]
  while (stops[0] !== from) stops.unshift(previous[stops[0]])
  return { minutes: best[to], stops }
}
