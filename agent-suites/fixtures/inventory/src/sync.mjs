// Replays stock events per SKU in timestamp order. Timestamps are milliseconds since epoch, as strings
// from the upstream feed.

export function replay(events) {
  const ordered = [...events].sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0))
  const stock = new Map()
  for (const event of ordered) {
    const current = stock.get(event.sku) ?? 0
    if (event.type === 'set') stock.set(event.sku, event.qty)
    else if (event.type === 'add') stock.set(event.sku, current + event.qty)
    else if (event.type === 'remove') stock.set(event.sku, Math.max(0, current - event.qty))
  }
  return stock
}
