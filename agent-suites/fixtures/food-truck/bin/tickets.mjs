import { readFileSync } from 'node:fs'
import { ticket } from '../src/orders.mjs'

const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))
const menu = read('menu.json')
console.log(
  read('orders.json')
    .map((order) => ticket(order, menu).join('\n'))
    .join('\n\n'),
)
