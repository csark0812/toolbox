import { readFileSync } from 'node:fs'
import { argv, exit } from 'node:process'
import { money } from '../src/accounts.mjs'
import { round } from '../src/round.mjs'

const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))
const monday = argv[2]
if (
  !/^\d{4}-\d{2}-\d{2}$/.test(monday ?? '') ||
  new Date(`${monday}T12:00:00Z`).getUTCDay() !== 1
) {
  console.error('Give the Monday the week starts on, like 2026-11-02')
  exit(1)
}
console.log(`Round for the week of ${monday}`)
for (const customer of round(read('customers.json'), read('cleans.json'), monday))
  console.log(
    `  ${customer.due}  ${customer.address.padEnd(22)}${customer.name.padEnd(11)}${money(customer.pence)}`,
  )
