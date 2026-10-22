import { readFileSync } from 'node:fs'
import * as shearing from '../src/shearing.mjs'

const columns = JSON.parse(readFileSync('config/report-columns.json', 'utf8'))

function cell(column, animal) {
  if (column.field) return String(animal[column.field] ?? '—')
  const arg = column.from === 'animal' ? animal : animal[column.from]
  try {
    const value = shearing[column.fn](arg)
    return column.money ? shearing.pounds(value) : String(value)
  } catch {
    return '—'
  }
}

for (const visit of shearing.loadVisits(process.argv[2])) {
  console.log(`${shearing.farmFor(visit).name}, ${visit.date}`)
  console.log(columns.map((c) => c.heading.padEnd(10)).join(''))
  for (const animal of visit.animals)
    console.log(columns.map((c) => cell(c, animal).padEnd(10)).join(''))
  console.log('')
}
