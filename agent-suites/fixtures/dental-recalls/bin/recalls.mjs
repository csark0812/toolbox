import { readFileSync } from 'node:fs'
import { argv, exit } from 'node:process'
import { dueIn } from '../src/recall.mjs'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))
const month = argv[2]
if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month ?? '')) {
  console.error('Usage: npm run recalls -- YYYY-MM')
  exit(1)
}
const dentists = new Map(read('dentists.json').map((dentist) => [dentist.id, dentist.name]))
const due = dueIn(read('patients.json'), month)
console.log(`Recalls due ${MONTHS[Number(month.slice(5)) - 1]} ${month.slice(0, 4)}: ${due.length}`)
for (const patient of due)
  console.log(
    `  ${patient.due}  ${patient.name.padEnd(14)}${dentists.get(patient.dentist).padEnd(16)}${patient.mobile || '-'}`,
  )
