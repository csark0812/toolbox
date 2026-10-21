import { readFileSync } from 'node:fs'
import { orderTotal, pounds } from '../src/orders.mjs'

const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))
const prices = read('prices.json')
for (const order of read('orders.json'))
  console.log(
    `${order.id}  ${order.customer.padEnd(8)}${pounds(orderTotal(order, prices)).padStart(8)}`,
  )
