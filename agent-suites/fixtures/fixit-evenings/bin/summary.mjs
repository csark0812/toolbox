import { readFileSync } from 'node:fs'
import { parseCsv, summarise } from '../src/summary.mjs'

const items = parseCsv(readFileSync(new URL('../data/items.csv', import.meta.url), 'utf8'))
const s = summarise(items)
console.log(`Items seen this year:   ${s.seen}`)
console.log(`Fixed:                  ${s.fixed}`)
console.log(`Waiting for a part:     ${s.waitingForPart}`)
console.log(`Could not be fixed:     ${s.couldNotFix}`)
