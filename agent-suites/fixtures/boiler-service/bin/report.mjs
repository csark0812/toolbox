#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { dueIn } from '../src/due.mjs'
import { renderTable } from '../src/report/table.mjs'

const month = argv[2]
if (!/^\d{4}-\d{2}$/.test(month ?? '')) {
  stderr.write('usage: report <YYYY-MM>\n')
  exit(2)
}
const customers = JSON.parse(
  readFileSync(new URL('../data/customers.json', import.meta.url), 'utf8'),
)
for (const line of renderTable(dueIn(customers, month))) stdout.write(`${line}\n`)
