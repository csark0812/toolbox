import { loadOrders, packLine } from '../src/orders.mjs'

for (const order of loadOrders()) console.log(packLine(order))
