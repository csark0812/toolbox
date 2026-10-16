#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { stdout } from 'node:process'
import { clock, pace } from '../src/clock.mjs'
import { chipTime, readMats } from '../src/splits.mjs'

const read = (name) => readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8')
const race = JSON.parse(read('race.json'))
const rows = [...readMats(read('mats.csv'))]
  .map(([bib, mats]) => ({ bib, time: chipTime(race, mats) }))
  .sort((a, b) => a.time - b.time)
stdout.write(`${race.name}\n`)
rows.forEach((row, i) =>
  stdout.write(
    `${String(i + 1).padStart(2)}. ${row.bib.padStart(4)}  ${race.runners[row.bib].padEnd(12)}${clock(row.time).padStart(8)}  ${pace(row.time, 42.195)}\n`,
  ),
)
