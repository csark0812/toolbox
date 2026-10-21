import { readFileSync } from 'node:fs'
import { argv } from 'node:process'
import { parseAttendance, positions } from '../src/attendance.mjs'

const records = parseAttendance(
  readFileSync(new URL('../data/attendance.csv', import.meta.url), 'utf8'),
)
const today = argv[2] ?? new Date().toISOString().slice(0, 10)
console.log(`Six-month rule on ${today}`)
for (const { councillor, last, runsOut, flag } of positions(records, today)) {
  console.log(
    `${councillor.padEnd(16)} last attended ${last ?? 'never    '}  runs out ${runsOut ?? '-         '}  ${flag}`.trimEnd(),
  )
}
