import { ship } from './order.mjs'
// Ships every paid, uncancelled order that has not shipped yet.
export function shipReady(orders) {
  return orders.map((order) =>
    order.isPaid && !order.isShipped && !order.isCancelled ? ship(order) : order,
  )
}
