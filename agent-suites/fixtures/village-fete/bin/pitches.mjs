import { readFileSync } from 'node:fs'
import { FETE, FETE_DATE } from '../src/config.mjs'
import { longDate, money, pitchFees } from '../src/pitches.mjs'

const stalls = JSON.parse(readFileSync(new URL('../data/stalls.json', import.meta.url), 'utf8'))
const rows = pitchFees(stalls)
console.log(`${FETE}, ${longDate(FETE_DATE)}`)
for (const row of rows)
  console.log(
    `  ${row.stall.padEnd(17)}${row.holder.padEnd(26)}${row.phone}  ${row.size.padEnd(5)}  ${money(row.pence)}`,
  )
console.log(`Pitch money ${money(rows.reduce((sum, row) => sum + row.pence, 0))}`)
