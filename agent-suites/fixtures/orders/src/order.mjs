// An order moves from new to paid to shipped, and can be cancelled before it ships.

export function createOrder(id) {
  return { id, isPaid: false, isShipped: false, isCancelled: false }
}

export function pay(order) {
  if (order.isCancelled || order.isPaid) throw new Error(`order ${order.id} cannot be paid`)
  return { ...order, isPaid: true }
}

export function ship(order) {
  if (!order.isPaid || order.isCancelled || order.isShipped)
    throw new Error(`order ${order.id} cannot ship`)
  return { ...order, isShipped: true }
}

export function cancel(order) {
  if (order.isShipped || order.isCancelled) throw new Error(`order ${order.id} cannot be cancelled`)
  return { ...order, isCancelled: true }
}
