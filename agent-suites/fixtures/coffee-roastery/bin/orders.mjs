import { readFileSync } from 'node:fs'
import { orderLine } from '../src/orders.mjs'

const orders = JSON.parse(readFileSync(new URL('../data/orders.json', import.meta.url), 'utf8'))
for (const order of orders) console.log(orderLine(order))
