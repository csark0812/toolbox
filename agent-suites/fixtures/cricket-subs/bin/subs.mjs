import { readFileSync } from 'node:fs'
import { householdBills } from '../src/subs.mjs'

const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))
const pounds = (pence) => `£${(pence / 100).toFixed(2)}`
const bills = householdBills(read('members.json'), read('family.json'))
for (const { household, surname, members, pence, capped } of bills)
  console.log(
    `household ${household.padStart(2)}  ${surname.padEnd(10)} ${members} ${members === 1 ? 'member ' : 'members'}  ${pounds(pence).padStart(7)}${capped ? '  (family cap)' : ''}`,
  )
console.log(`season total ${pounds(bills.reduce((sum, bill) => sum + bill.pence, 0))}`)
