import { orderSheet } from '../src/order-sheet.mjs'
import { findOrder } from '../src/orders.mjs'

const [ref, file] = process.argv.slice(2)
try {
  process.stdout.write(orderSheet(findOrder(ref, file)))
} catch (error) {
  console.error(`sheet: ${error.message}`)
  process.exit(1)
}
