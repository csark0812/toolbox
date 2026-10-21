import { readFileSync } from 'node:fs'
import { argv } from 'node:process'
import { drinkNext } from '../src/next.mjs'

const cellar = JSON.parse(readFileSync(new URL('../data/cellar.json', import.meta.url), 'utf8'))
const today = argv[2] ?? new Date().toISOString().slice(0, 10)
const list = drinkNext(cellar, today)
if (!list.length) console.log(`Nothing to drink on ${today}.`)
for (const entry of list)
  console.log(
    `${entry.id}  ${entry.wine.padEnd(40)}#${entry.rank}  ${String(entry.daysLeft).padStart(4)} days left`,
  )
