// Human label for the support dashboard.
export function label(order) {
  if (order.isCancelled) return 'Cancelled'
  if (order.isShipped) return 'Shipped'
  if (order.isPaid) return 'Paid'
  return 'New'
}
