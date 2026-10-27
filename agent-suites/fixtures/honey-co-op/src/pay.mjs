/** Pence per kilogram. */
export const OLD_PRICE = 750
export const NEW_PRICE = 820
export const NEW_PRICE_FROM = '2026-09-01'

/** The price per kilogram, in pence, for honey delivered on `date` (YYYY-MM-DD). */
export function priceFor(date) {
  return date > NEW_PRICE_FROM ? NEW_PRICE : OLD_PRICE
}

/** The delivery's weight in kilograms. */
export function weightKg(delivery) {
  return parseFloat(delivery.kg)
}

/** What the co-op pays for one delivery, in pence. */
export function deliveryPence(delivery) {
  return Math.round(weightKg(delivery) * priceFor(delivery.date))
}

/** Each member's kilograms and pay for the month (YYYY-MM), in order of first delivery. */
export function statement(deliveries, month) {
  const members = new Map()
  for (const delivery of deliveries) {
    if (!delivery.date.startsWith(month)) continue
    const row = members.get(delivery.member) ?? { member: delivery.member, kg: 0, pence: 0 }
    row.kg += weightKg(delivery)
    row.pence += deliveryPence(delivery)
    members.set(delivery.member, row)
  }
  return [...members.values()]
}
