#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { timetable } from '../src/schedule.mjs'

const [from, days = '14'] = argv.slice(2)
if (!/^\d{4}-\d{2}-\d{2}$/.test(from ?? '')) {
  stderr.write('usage: schedule <from YYYY-MM-DD> [days]\n')
  exit(2)
}
const classes = JSON.parse(readFileSync(new URL('../data/classes.json', import.meta.url), 'utf8'))
for (const row of timetable(classes, from, Number(days))) stdout.write(`${row.label}\n`)
