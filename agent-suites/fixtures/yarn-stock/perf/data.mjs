// A year of deliveries and sales at the wool shop, generated the same way every time.
export function makeBooks() {
  let seed = 20261103
  const next = () => (seed = (seed * 48271) % 2147483647)
  const SKUS = Array.from({ length: 36 }, (_, i) => `DK-${String(101 + i * 7)}`)
  const day = (n) => new Date(Date.UTC(2025, 10, 1) + n * 86400000).toISOString().slice(0, 10)
  const purchases = []
  for (let i = 0; i < 200; i++) {
    const qty = [10, 10, 20, 25, 3, 7][next() % 6]
    purchases.push({
      sku: SKUS[next() % SKUS.length],
      date: day(next() % 330),
      qty,
      pence: qty * (180 + (next() % 160)) + (next() % 3) * 17,
    })
  }
  const sales = []
  for (let i = 0; i < 600; i++) {
    sales.push({
      id: `T${5000 + i}`,
      sku: SKUS[next() % SKUS.length],
      date: day(20 + (next() % 345)),
      qty: 1 + (next() % 6),
    })
  }
  return { purchases, sales }
}
