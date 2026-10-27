import { readFileSync } from 'node:fs'
import { invoice } from '../src/invoice.mjs'

const tags = JSON.parse(readFileSync(new URL('../data/tags.json', import.meta.url), 'utf8'))
const pounds = (pence) => `£${(pence / 100).toFixed(2)}`
let total = 0
for (const tag of tags) {
  const { cm, tree, delivery, total: due } = invoice(tag)
  console.log(
    `${tag.tag}  ${tag.customer.padEnd(10)}  ${String(Math.round(cm)).padStart(3)} cm  tree ${pounds(tree)}  delivery ${pounds(delivery)}  total ${pounds(due)}`,
  )
  total += due
}
console.log(`Total ${pounds(total)}`)
