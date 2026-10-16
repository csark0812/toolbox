// Deterministic synthetic sales, produced lazily one record at a time.
const NAMES = ['Ana Lima', 'Ben Ortiz', 'Chen Wei', 'Dara "DJ" Kim', 'Eli Moss, Jr.', ' Fay Ng ']
const COUNTRIES = ['us', 'ca', 'mx', 'de', 'fr', 'jp', 'br']
const NOTES = [null, null, null, 'gift wrap', 'leave at door, back porch', 'split\nshipment']

export function* makeSales(count) {
  let seed = 424242
  const next = () => (seed = (seed * 48271) % 2147483647)
  const start = Date.UTC(2026, 9, 14)
  for (let i = 0; i < count; i++) {
    const refund = next() % 40 === 0
    yield {
      orderId: `SO-${String(100000 + i)}`,
      at: start + (next() % 86400000),
      customer: NAMES[next() % NAMES.length],
      country: COUNTRIES[next() % COUNTRIES.length],
      sku: `SKU-${next() % 5000}`,
      qty: 1 + (next() % 4),
      amountCents: (refund ? -1 : 1) * (199 + (next() % 50000)),
      note: NOTES[next() % NOTES.length],
      tags: ['web', next() % 2 ? 'promo' : 'full-price'],
    }
  }
}
