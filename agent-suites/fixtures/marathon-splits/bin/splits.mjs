#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { clock, pace } from '../src/clock.mjs'
import { chipTime, readMats, splits } from '../src/splits.mjs'

const read = (name) => readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8')
const race = JSON.parse(read('race.json'))
const bib = argv[2]
const mats = readMats(read('mats.csv')).get(bib)
if (!mats) {
  stderr.write(`splits: no runner with bib ${bib ?? ''}\n`)
  exit(1)
}
stdout.write(`Bib ${bib}  ${race.runners[bib]}\n`)
for (const split of splits(race, mats))
  stdout.write(
    `  ${split.from.padEnd(6)} -> ${split.to.padEnd(7)}${clock(split.seconds).padStart(8)}  ${pace(split.seconds, split.km)}\n`,
  )
stdout.write(`  ${'Chip time'.padEnd(17)}${clock(chipTime(race, mats)).padStart(8)}\n`)
