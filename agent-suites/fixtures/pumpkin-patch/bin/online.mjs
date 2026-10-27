// Price the click-and-collect orders. npm run online [-- --file data/other-orders.json]
import { readFileSync } from 'node:fs'
import { pounds } from '../src/money.mjs'
import { quoteOrder } from '../src/online-orders.mjs'

const args = process.argv.slice(2)
const at = args.indexOf('--file')
const file = at === -1 ? 'data/orders.json' : args[at + 1]
let orders
try {
  orders = JSON.parse(readFileSync(file, 'utf8'))
} catch (error) {
  console.error(`Could not read ${file}: ${error.code ?? error.message}`)
  process.exit(1)
}
let failed = 0
for (const order of orders) {
  try {
    const { lines, totalPence } = quoteOrder(order.items)
    const detail = lines
      .map((line) => `${line.variety} ${line.kg}kg ${pounds(line.pence)}`)
      .join(', ')
    console.log(`${order.ref} ${order.name}: ${pounds(totalPence)} (${detail})`)
  } catch (error) {
    failed++
    console.log(`${order.ref} ${order.name}: cannot quote: ${error.message}`)
  }
}
if (failed) process.exitCode = 1
