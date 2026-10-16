/** How many of each product to bake for collections on `day`, alphabetical. */
export function bakeList(orders, day) {
  const totals = new Map()
  for (const order of orders) {
    if (!order.pickup.startsWith(`${day}T`)) continue
    for (const item of order.items)
      totals.set(item.product, (totals.get(item.product) ?? 0) + item.qty)
  }
  return [...totals]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([product, qty]) => ({ product, qty }))
}
