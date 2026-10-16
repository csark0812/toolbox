#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, stdout } from 'node:process'
import { weeklyReport } from '../src/report.mjs'

const { people, entries } = JSON.parse(readFileSync(argv[2] ?? 'data/sample.json', 'utf8'))
const { rows, skipped } = weeklyReport(entries, people)
for (const row of rows)
  stdout.write(
    `${row.person.padEnd(16)} ${row.week}  ${String(row.hours).padStart(6)} h  overtime ${String(row.overtime).padStart(5)} h  ${row.projects}\n`,
  )
if (skipped) stdout.write(`${skipped} entries for unknown people skipped\n`)
