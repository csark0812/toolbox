// Deterministic production-sized sample: 6000 records, 4000 unique players.
export function makeSample(size = 6000, players = 4000) {
  let seed = 7
  const next = () => (seed = (seed * 1103515245 + 12345) % 2147483648) >>> 8
  const records = []
  for (let index = 0; index < size; index++) {
    const id = `p${String(next() % players).padStart(5, '0')}`
    const rounds = Array.from({ length: 20 }, () => ({
      points: next() % 100,
      multiplier: 1 + (next() % 3),
    }))
    records.push({ id, rounds })
  }
  return records
}
