import { readFileSync } from 'node:fs'
import { argv, exit } from 'node:process'
import { invoice, money } from '../src/billing.mjs'
import { PENCE_PER_HALF_HOUR } from '../src/config.mjs'

const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))
const dog = argv[2]
const entry = read('dogs.json').find((record) => record.dog === dog)
if (!entry) {
  console.error(`No dog called ${dog}`)
  exit(1)
}
const { lines, total } = invoice(read('walks.json'), dog)
console.log(`Invoice for ${dog} (${entry.owner})`)
for (const line of lines)
  console.log(
    `  ${line.date}  ${String(line.minutes).padStart(3)} min  ${line.walker.padEnd(7)}${line.units} x ${money(PENCE_PER_HALF_HOUR)}  ${money(line.pence)}`,
  )
console.log(`  Total ${money(total)}`)
