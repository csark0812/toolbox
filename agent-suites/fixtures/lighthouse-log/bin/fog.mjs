import { readFileSync } from 'node:fs'
import { argv } from 'node:process'
import { monthReport, parseLog } from '../src/fog.mjs'

const entries = parseLog(readFileSync(new URL('../data/fog.csv', import.meta.url), 'utf8'))
const month = argv[2] ?? '2026-10'
const hours = (minutes) => (minutes / 60).toFixed(2)
const { days, total } = monthReport(entries, month)
for (const [day, minutes] of days) console.log(`${day}  ${hours(minutes).padStart(5)} h`)
console.log(`Total  ${hours(total)} h`)
