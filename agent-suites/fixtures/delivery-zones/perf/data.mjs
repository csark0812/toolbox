// The full city map and a day's addresses, generated the same way every time.
export function makeCity() {
  let seed = 4242
  const next = () => (seed = (seed * 48271) % 2147483647)
  const zones = []
  for (let gx = 0; gx < 16; gx++)
    for (let gy = 0; gy < 16; gy++) {
      const cx = gx * 1000 + 500
      const cy = gy * 1000 + 500
      const sides = 10 + (next() % 20)
      const pairs = []
      for (let k = 0; k < sides; k++) {
        const angle = (2 * Math.PI * k) / sides
        const r = 380 + (next() % 260)
        pairs.push(
          `${Math.round(cx + r * Math.cos(angle))},${Math.round(cy + r * Math.sin(angle))}`,
        )
      }
      zones.push({ id: `R${gx}-${gy}`, boundary: pairs.join(' ') })
    }
  const addresses = Array.from({ length: 900 }, (_, i) => ({
    id: `A${i}`,
    at: [next() % 16000, next() % 16000],
  }))
  return { zones, addresses }
}
