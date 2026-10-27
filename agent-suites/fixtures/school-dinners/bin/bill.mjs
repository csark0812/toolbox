import { readFileSync } from 'node:fs'
import { PRICE_PENCE } from '../src/config.mjs'
import { bill, money } from '../src/meals.mjs'

const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))
const days = read('days.json')
const rows = bill(read('pupils.json'), read('absences.json'), days)
console.log(`Dinner money, autumn first half term (${days.length} days at ${money(PRICE_PENCE)})`)
for (const row of rows)
  console.log(
    `  ${row.class}  ${row.name.padEnd(14)}${String(row.dinners).padStart(2)}  ${row.freeMeals ? 'free' : money(row.pence)}`,
  )
console.log(`Total ${money(rows.reduce((sum, row) => sum + row.pence, 0))}`)
