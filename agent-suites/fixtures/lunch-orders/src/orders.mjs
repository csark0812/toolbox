/** The day an order is delivered on. */
export function deliveryDate(order) {
  return order.date
}

/** Orders delivered on `date`. */
export const ordersFor = (orders, date) => orders.filter((order) => deliveryDate(order) === date)

/** How many of each dish to make, most popular first, then by name. */
export function kitchenSheet(orders) {
  const counts = new Map()
  for (const order of orders) counts.set(order.dish, (counts.get(order.dish) ?? 0) + 1)
  return [...counts]
    .sort(([a, x], [b, y]) => y - x || a.localeCompare(b))
    .map(([dish, count]) => ({ dish, count }))
}
