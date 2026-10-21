import { readFileSync } from 'node:fs'
import { money, owed } from '../src/accounts.mjs'
import { PHONE } from '../src/config.mjs'

const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))
const rows = owed(read('customers.json'), read('cleans.json'), read('payments.json'))
for (const row of rows)
  console.log(`  ${row.id}  ${row.address.padEnd(22)}${row.name.padEnd(11)}${money(row.balance)}`)
console.log(`Total owed ${money(rows.reduce((sum, row) => sum + row.balance, 0))}`)
console.log(`Reminder slips: ring us on ${PHONE} with any questions.`)
