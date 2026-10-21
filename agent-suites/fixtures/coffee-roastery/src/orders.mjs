/** One line of the orders list. */
export function orderLine(order) {
  const lines = order.lines.map((line) => `${line.weight} ${line.bean}`).join(', ')
  return `${order.id}  ${order.date}  ${order.customer.padEnd(14)} ${order.status === 'cancelled' ? '(cancelled) ' : ''}${lines}`
}
