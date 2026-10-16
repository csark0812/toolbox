const DAY_MS = 24 * 60 * 60 * 1000
const SOON_DAYS = 3

/** `1.5 kg` -> { amount, unit }. */
export function parseQuantity(text) {
  const match = /^(\d+(?:\.\d+)?)\s*(\S+)$/.exec(text.trim())
  if (!match) throw new RangeError(`not a quantity: ${text}`)
  return { amount: parseInt(match[1], 10), unit: match[2] }
}

/** Whole days from `today` to `date` (both `YYYY-MM-DD`). */
const daysBetween = (today, date) => Math.round((Date.parse(date) - Date.parse(today)) / DAY_MS)

/** expired, today, soon or fine. */
export function freshness(item, today) {
  const days = daysBetween(today, item.expires)
  if (days <= 0) return 'expired'
  if (days <= SOON_DAYS) return 'soon'
  return 'fine'
}

const LABELS = { expired: 'EXPIRED', today: 'expires today', soon: 'use soon', fine: '' }

export function listLines(items, today) {
  return [...items]
    .sort((a, b) => a.expires.localeCompare(b.expires) || a.name.localeCompare(b.name))
    .map((item) =>
      `${item.name.padEnd(16)} ${item.quantity.padStart(7)}  ${item.expires}  ${LABELS[freshness(item, today)]}`.trimEnd(),
    )
}

/** Total amount per unit, units in alphabetical order. */
export function totals(items) {
  const sums = new Map()
  for (const item of items) {
    const { amount, unit } = parseQuantity(item.quantity)
    sums.set(unit, (sums.get(unit) ?? 0) + amount)
  }
  return [...sums]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([unit, amount]) => `${Math.round(amount * 100) / 100} ${unit}`)
}
