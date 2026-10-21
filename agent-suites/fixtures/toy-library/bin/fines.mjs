import { readFileSync } from 'node:fs'
import { argv } from 'node:process'
import { finesByFamily } from '../src/fines.mjs'

const loans = JSON.parse(readFileSync(new URL('../data/loans.json', import.meta.url), 'utf8'))
const at = argv.indexOf('--today')
const today = at === -1 ? new Date().toISOString().slice(0, 10) : argv[at + 1]
const fines = finesByFamily(loans, today)
console.log(`Fines to ${today}`)
if (!fines.length) console.log('  No fines.')
for (const entry of fines)
  console.log(
    `  ${entry.family.padEnd(12)}${entry.toys} ${entry.toys === 1 ? 'toy ' : 'toys'}  £${(entry.pence / 100).toFixed(2)}`,
  )
