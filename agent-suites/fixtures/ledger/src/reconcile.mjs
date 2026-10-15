const DAY_MS = 24 * 60 * 60 * 1000
const MAX_DAYS = 3

/** References match without case, punctuation or leading zeros: "inv-0042" equals "INV42". */
export function normalizeRef(ref) {
  return ref
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .replace(/^([A-Z]*)0+(?=\d)/, '$1')
}

function daysBetween(a, b) {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / DAY_MS
}

function toCents(amount) {
  return Math.round(parseFloat(amount) * 100)
}

/**
 * Matches statement lines ({ line, ref, amount: "12.34", date }) to ledger entries
 * ({ id, ref, amountCents, date }). Returns matched [line, id] pairs in statement order and
 * the lines and entry ids left over.
 */
export function reconcile(entries, statement) {
  const used = new Set()
  const matched = []
  for (const item of statement) {
    const candidates = entries.filter(
      (entry) =>
        !used.has(entry.id) &&
        normalizeRef(entry.ref) === normalizeRef(item.ref) &&
        entry.amountCents === toCents(item.amount),
    )
    candidates.sort(
      (a, b) => daysBetween(a.date, item.date) - daysBetween(b.date, item.date) || a.id - b.id,
    )
    const best = candidates[0]
    if (best && daysBetween(best.date, item.date) <= MAX_DAYS) {
      used.add(best.id)
      matched.push([item.line, best.id])
    }
  }
  const matchedLines = new Set(matched.map(([line]) => line))
  return {
    matched,
    unmatchedLines: statement.filter((item) => !matchedLines.has(item.line)).map((i) => i.line),
    unmatchedEntries: entries.filter((entry) => !used.has(entry.id)).map((entry) => entry.id),
  }
}
