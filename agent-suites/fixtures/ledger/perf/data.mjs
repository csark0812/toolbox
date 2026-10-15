// Deterministic month-end data set: ledger entries and a bank statement that mostly matches them.
export function makeMonth({ entries: count = 1500, seed = 7 } = {}) {
  let state = seed
  const next = () => (state = (state * 48271) % 2147483647)
  const day = (n) => new Date(Date.UTC(2026, 8, 1 + n)).toISOString().slice(0, 10)
  const prefixes = ['INV', 'PO', 'RF', 'CR']
  const entries = []
  const statement = []
  for (let id = 1; id <= count; id++) {
    const number = next() % 600
    const prefix = prefixes[next() % prefixes.length]
    const amountCents = 100 * (1 + (next() % 40)) + (next() % 3) * 25
    const date = next() % 28
    entries.push({
      id,
      ref: `${prefix}-${String(number).padStart(5, '0')}`,
      amountCents,
      date: day(date),
    })
    if (next() % 10 < 8) {
      const shift = (next() % 7) - 3
      const ref =
        next() % 2
          ? `${prefix.toLowerCase()} ${number}`
          : `${prefix}${String(number).padStart(4, '0')}`
      statement.push({
        ref,
        amount: (amountCents / 100).toFixed(2),
        date: day(Math.max(0, date + shift)),
      })
    }
  }
  for (let i = statement.length - 1; i > 0; i--) {
    const j = next() % (i + 1)
    ;[statement[i], statement[j]] = [statement[j], statement[i]]
  }
  statement.forEach((item, index) => (item.line = index + 1))
  return { entries, statement }
}
