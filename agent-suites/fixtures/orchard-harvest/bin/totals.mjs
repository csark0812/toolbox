import { readFileSync } from 'node:fs'
import { argv } from 'node:process'
import { parseCsv } from '../src/csv.mjs'
import { dayTotals } from '../src/totals.mjs'

const rows = parseCsv(readFileSync(new URL('../data/weighins.csv', import.meta.url), 'utf8'))
const day = argv[2] ?? '2026-10-10'
console.log(`Harvest for ${day}`)
for (const { picker, kg, pence } of dayTotals(rows, day))
  console.log(`  ${picker.padEnd(6)}${kg.toFixed(1).padStart(7)} kg  £${(pence / 100).toFixed(2)}`)
