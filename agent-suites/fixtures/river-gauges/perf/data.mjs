// A month of 15-minute readings from the whole catchment, generated the same way every time.
export const GAUGES = [
  'Upton',
  'Kempsey',
  'Worcester',
  'Bewdley',
  'Saxons Lode',
  'Tewkesbury',
  'Powick',
  'Knightsford',
]

export function makeReadings() {
  let seed = 20261109
  const next = () => (seed = (seed * 48271) % 2147483647)
  const thresholds = Object.fromEntries(GAUGES.map((gauge, i) => [gauge, 2 + i * 0.25]))
  const readings = []
  for (const gauge of GAUGES) {
    let level = thresholds[gauge] - 0.6
    for (let step = 0; step < 30 * 96; step++) {
      level = Math.max(0.2, level + ((next() % 21) - 10) / 100)
      if (next() % 400 === 0) continue
      const at = new Date(Date.UTC(2026, 9, 1) + step * 15 * 60 * 1000).toISOString().slice(0, 16)
      readings.push({ gauge, at, level: next() % 300 === 0 ? null : Math.round(level * 100) / 100 })
    }
  }
  // The feed arrives interleaved by gauge, not in time order.
  for (let i = readings.length - 1; i > 0; i--) {
    const j = next() % (i + 1)
    ;[readings[i], readings[j]] = [readings[j], readings[i]]
  }
  return { readings, thresholds }
}
