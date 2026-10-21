import { readFileSync } from 'node:fs'
import { argv, exit } from 'node:process'
import { ORDERS_CLOSE } from '../src/config.mjs'
import { kitchenSheet } from '../src/meals.mjs'

const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))
const day = argv[2]
if (!read('days.json').includes(day)) {
  console.error(`${day ?? 'That'} is not a school day`)
  exit(1)
}
const { dinners, packed } = kitchenSheet(read('pupils.json'), read('absences.json'), day)
console.log(`Kitchen sheet for ${day}`)
console.log(`  School dinners: ${dinners}`)
console.log(`  Packed lunches: ${packed}`)
console.log(`Orders for tomorrow close at ${ORDERS_CLOSE}.`)
