import { readFileSync } from 'node:fs'
import { argv } from 'node:process'
import { monthRain, parseTips } from '../src/rain.mjs'

const stamps = parseTips(readFileSync(new URL('../data/tips.csv', import.meta.url), 'utf8'))
const month = argv[2] ?? '2026-10'
const days = monthRain(stamps, month)
for (const { day, mm, heavy } of days) {
  console.log(`${day}  ${mm.toFixed(1).padStart(5)} mm${heavy ? '  HEAVY' : ''}`)
}
const total = days.reduce((sum, { mm }) => sum + mm, 0)
console.log(`total       ${total.toFixed(1)} mm`)
