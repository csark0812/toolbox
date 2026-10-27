import { readFileSync } from 'node:fs'
import { argv } from 'node:process'
import { toIso } from '../src/dates.mjs'
import { mooringStatus, parseInspections } from '../src/moorings.mjs'

const read = (name) => readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8')
const moorings = read('moorings.csv')
  .trim()
  .split('\n')
  .slice(1)
  .map((row) => row.split(',')[0])
const inspections = parseInspections(read('lifts.csv'), read('dives.csv'))
const today = argv[2] ?? new Date().toISOString().slice(0, 10)
for (const { mooring, last, due, status } of mooringStatus(moorings, inspections, today)) {
  const dates = last === null ? 'never inspected' : `last ${toIso(last)}  due ${toIso(due)}`
  console.log(`${mooring}  ${dates}${status === 'OK' ? '' : `  ${status}`}`)
}
