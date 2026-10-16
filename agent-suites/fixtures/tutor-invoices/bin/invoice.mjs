#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { invoices, pounds } from '../src/invoice.mjs'

const month = argv[2]
if (!/^\d{4}-\d{2}$/.test(month ?? '')) {
  stderr.write('usage: invoice <YYYY-MM>\n')
  exit(2)
}
const lessons = JSON.parse(readFileSync(new URL('../data/lessons.json', import.meta.url), 'utf8'))
for (const family of invoices(lessons, month)) {
  stdout.write(`${family.family}\n`)
  for (const line of family.lines)
    stdout.write(
      `  ${line.date}  ${line.student.padEnd(5)} ${String(line.minutes).padStart(3)} min  ${pounds(line.charge).padStart(7)}\n`,
    )
  stdout.write(`  Total ${pounds(family.total).padStart(29)}\n`)
}
