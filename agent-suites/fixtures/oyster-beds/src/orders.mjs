import { readFileSync } from 'node:fs'

export function loadOrders(path = 'data/orders.json') {
  return JSON.parse(readFileSync(path, 'utf8'))
}

export function packLine(order) {
  return `${order.customer.padEnd(18)}${order.grade.padEnd(6)}${order.dozens} dozen`
}
