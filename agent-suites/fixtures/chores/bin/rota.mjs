#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { rota } from '../src/rota.mjs'

const week = argv[2]
if (!week) {
  stderr.write('usage: rota <ISO week, e.g. 2026-W42>\n')
  exit(2)
}
const household = JSON.parse(
  readFileSync(new URL('../data/household.json', import.meta.url), 'utf8'),
)
for (const { chore, member } of rota(household, week))
  stdout.write(`${chore.padEnd(10)} ${member}\n`)
