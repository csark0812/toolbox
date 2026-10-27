import { readFileSync } from 'node:fs'
import { mmss, results } from '../src/score.mjs'

const race = JSON.parse(readFileSync(new URL('../data/runners.json', import.meta.url), 'utf8'))
console.log('Place  Runner      Time   Penalty  Allowance  Adjusted')
for (const r of results(race))
  console.log(
    `${String(r.place).padEnd(7)}${r.name.padEnd(12)}${mmss(r.time).padEnd(7)}+${mmss(r.penalty).padEnd(8)}-${mmss(r.allowance).padEnd(10)}${mmss(r.adjusted)}`,
  )
