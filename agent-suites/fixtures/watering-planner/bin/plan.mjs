#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { plan } from '../src/schedule.mjs'

const [start, months = '1'] = argv.slice(2)
if (!start || !(Number(months) > 0)) {
  stderr.write('usage: plan <YYYY-MM-DD> [months]\n')
  exit(2)
}
const plants = JSON.parse(readFileSync(new URL('../data/plants.json', import.meta.url), 'utf8'))
try {
  for (const row of plan(plants, start, Number(months)))
    stdout.write(`${row.date}  ${row.kind.padEnd(5)}  ${row.plant}\n`)
} catch (error) {
  stderr.write(`${error.message}\n`)
  exit(2)
}
