// A month of predictions for the estuary ports and a day's batch of look-ups, generated the same
// way every time.
const PORTS = ['Dartmouth', 'Brixham', 'Salcombe', 'Teignmouth', 'Exmouth', 'Plymouth']
const pad = (n) => String(n).padStart(2, '0')
const stamp = (minutes) => {
  const at = new Date(Date.UTC(2026, 10, 1) + minutes * 60000)
  return `${at.getUTCFullYear()}-${pad(at.getUTCMonth() + 1)}-${pad(at.getUTCDate())}T${pad(at.getUTCHours())}:${pad(at.getUTCMinutes())}`
}
const spell = (port, roll) =>
  roll % 5 === 0 ? port.toUpperCase() : roll % 7 === 0 ? ` ${port.toLowerCase()} ` : port

export function makeBatch() {
  let seed = 20261102
  const next = () => (seed = (seed * 48271) % 2147483647)
  const tides = []
  let n = 0
  for (const port of PORTS)
    for (let minutes = next() % 400; minutes < 30 * 24 * 60; minutes += 360 + (next() % 50) - 25) {
      tides.push({
        id: `T${String(n++).padStart(5, '0')}`,
        port: spell(port, next()),
        kind: tides.length % 2 ? 'low' : 'high',
        time: stamp(minutes),
        height: Number((1 + (next() % 40) / 10).toFixed(1)),
      })
    }
  const order = tides.map((tide) => [next(), tide]).sort((a, b) => a[0] - b[0])
  const queries = []
  for (let q = 0; q < 1200; q++)
    queries.push({
      id: `Q${q}`,
      port: spell(PORTS[next() % PORTS.length], next()),
      at: stamp(next() % (31 * 24 * 60)),
    })
  return { tides: order.map(([, tide]) => tide), queries }
}
