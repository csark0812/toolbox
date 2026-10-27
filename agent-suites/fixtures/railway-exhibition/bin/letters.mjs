import { readFileSync } from 'node:fs'
import { fill } from '../src/show.mjs'

// Prints one letter per exhibitor, or just the one named.
const only = process.argv[2]
const [header, ...rows] = readFileSync(new URL('../data/exhibitors.csv', import.meta.url), 'utf8')
  .trim()
  .split('\n')
const keys = header.split(',')
const exhibitors = rows.map((row) => Object.fromEntries(row.split(',').map((v, i) => [keys[i], v])))
const template = readFileSync(new URL('../templates/exhibitor-letter.txt', import.meta.url), 'utf8')
for (const exhibitor of exhibitors.filter((e) => !only || e.name === only)) {
  console.log(fill(template, { ...exhibitor, pat: exhibitor.pat_tested_until }))
  console.log('---')
}
