import { readFileSync } from 'node:fs'
import { parseCsv, payoutDue } from '../src/settle.mjs'

const read = (file) => parseCsv(readFileSync(new URL(`../data/${file}`, import.meta.url), 'utf8'))
const tickets = read('tickets.csv')
const performances = [...new Set(tickets.map((t) => t.performance))]
const pounds = (pence) => `£${(pence / 100).toFixed(2)}`

let total = 0
for (const performance of performances) {
  const due = payoutDue(tickets, performance)
  total += due
  console.log(`${performance}  due ${pounds(due)}`)
}
console.log(`Total due from the platform: ${pounds(total)}`)
