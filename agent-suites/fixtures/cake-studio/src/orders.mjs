import { readFileSync } from 'node:fs'

export const config = JSON.parse(
  readFileSync(new URL('../config/studio.json', import.meta.url), 'utf8'),
)

export function loadOrders(path = 'data/orders.json') {
  return JSON.parse(readFileSync(path, 'utf8'))
}

export function findOrder(ref, path) {
  const order = loadOrders(path).find((o) => o.ref === ref)
  if (!order) throw new Error(`No order ${ref}`)
  return order
}

export const pounds = (pence) => '£' + (pence / 100).toFixed(2)
