import { readFileSync } from 'node:fs'
import { fees, parseAttendance } from '../src/fees.mjs'

const period = process.argv[2] ?? '2026'
const pitches = parseAttendance(
  readFileSync(new URL('../data/attendance.csv', import.meta.url), 'utf8'),
)
console.log(`Pitch fees for ${period}: £${fees(pitches, period).toLocaleString('en-GB')}`)
