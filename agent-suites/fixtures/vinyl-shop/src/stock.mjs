export const LOW = 2

export function parseStock(text) {
  const [, ...rows] = text.trim().split('\n')
  return rows.map((row) => {
    const [sku, artist, title, location, copies] = row.split(',')
    return { sku, artist, title, location, copies: Number(copies) }
  })
}

/** Each record's copies across every location, in SKU order. */
export function totals(rows) {
  const bySku = new Map()
  for (const row of rows) {
    const entry = bySku.get(row.sku) ?? {
      sku: row.sku,
      artist: row.artist,
      title: row.title,
      copies: 0,
    }
    entry.copies += row.copies
    bySku.set(row.sku, entry)
  }
  return [...bySku.values()].sort((a, b) => (a.sku < b.sku ? -1 : 1))
}

/** The reorder sheet: sold out everywhere, and running low. */
export function reorderSheet(rows) {
  const soldOut = []
  const low = []
  for (const record of totals(rows)) {
    if (record.copies === 0) soldOut.push(record)
    else if (record.copies < LOW) low.push(record)
  }
  return { soldOut, low }
}
