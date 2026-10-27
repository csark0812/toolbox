/** Parse a CSV export into records. */
export function parseCsv(text) {
  const [header, ...rows] = text.trim().split('\n')
  const keys = header.split(',')
  return rows.map((row) => Object.fromEntries(row.split(',').map((v, i) => [keys[i], v.trim()])))
}

/** Count items by outcome for the annual report. */
export function summarise(items) {
  return {
    seen: items.length,
    fixed: items.filter((i) => i.outcome === 'fixed').length,
    // Anything we ordered a part for is waiting on that part.
    waitingForPart: items.filter((i) => i.part_ordered === 'yes').length,
    couldNotFix: items.filter((i) => i.outcome === 'not-fixable').length,
  }
}
