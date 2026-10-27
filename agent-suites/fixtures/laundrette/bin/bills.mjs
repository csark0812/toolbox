import { readFileSync } from 'node:fs'
import { argv } from 'node:process'
import { bill } from '../src/billing.mjs'
import { parseLog } from '../src/log.mjs'

const read = (name) => readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8')
const entries = parseLog(read('machines.log'))
const customers = JSON.parse(read('customers.json'))
const month = argv[2] ?? new Date().toISOString().slice(0, 7)
const money = (pence) => `£${(pence / 100).toFixed(2)}`
for (const customer of customers) {
  const { programmes, pence } = bill(entries, customer.card, month)
  console.log(
    `${customer.card.padEnd(4)} ${customer.name.padEnd(12)} ${String(programmes).padStart(2)} programmes  ${money(pence).padStart(7)}`,
  )
}
