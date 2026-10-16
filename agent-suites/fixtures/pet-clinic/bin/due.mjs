#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, stdout } from 'node:process'
import { dueList } from '../src/reminders.mjs'

const args = argv.slice(2)
const todayAt = args.indexOf('--today')
const today = todayAt === -1 ? new Date().toISOString().slice(0, 10) : args[todayAt + 1]
const pets = JSON.parse(readFileSync(new URL('../data/pets.json', import.meta.url), 'utf8'))
const rows = dueList(pets, today)
for (const row of rows)
  stdout.write(
    `${row.due}  ${row.pet.padEnd(8)} ${row.vaccine.padEnd(14)} ${row.label}  (${row.owner})\n`,
  )
if (!rows.length) stdout.write('nothing due\n')
