import { readFileSync } from 'node:fs'
import { argv } from 'node:process'
import { dueIn } from '../src/due.mjs'

const customers = JSON.parse(
  readFileSync(new URL('../data/customers.json', import.meta.url), 'utf8'),
)
const month = argv[2] ?? '2027-02'
const due = dueIn(customers, month)
console.log(`Due in ${month}: ${due.length}`)
for (const { due: date, id, name, interval } of due)
  console.log(`  ${date}  ${id}  ${name.padEnd(14)} ${interval}-monthly`)
