// A deterministic synthetic city: a ring of districts with cross-town links, a few unreachable
// depots, and a fixed batch of journeys.
export function makeCity({ stops = 600, journeys = 80 } = {}) {
  let seed = 20261016
  const next = () => (seed = (seed * 48271) % 2147483647)
  const ids = Array.from({ length: stops }, (_, i) => `S${String(i).padStart(4, '0')}`)
  const network = { stops: ids.map((id, i) => ({ id, name: `Stop ${i}` })), links: [] }
  const link = (a, b) => {
    const minutes = 1 + (next() % 9)
    network.links.push({ from: ids[a], to: ids[b], minutes })
    network.links.push({ from: ids[b], to: ids[a], minutes: minutes + (next() % 2) })
  }
  const served = stops - 3
  for (let i = 0; i < served; i++) {
    link(i, (i + 1) % served)
    link(i, next() % served)
    if (i % 3 === 0) link(i, next() % served)
  }
  const pairs = Array.from({ length: journeys }, (_, i) => [
    ids[next() % served],
    i % 20 === 0 ? ids[served + (i % 3)] : ids[next() % served],
  ])
  return { network, pairs }
}
