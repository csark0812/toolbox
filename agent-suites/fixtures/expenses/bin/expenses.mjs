#!/usr/bin/env node
import { argv, exit, stderr, stdout } from 'node:process'
import { loadExpenses } from '../src/expenses.mjs'
import { formatDollars, totalsByPerson } from '../src/totals.mjs'

const [command] = argv.slice(2)
const expenses = loadExpenses()

if (command === 'summary') {
  for (const { person, total } of totalsByPerson(expenses))
    stdout.write(`${person.padEnd(8)} ${formatDollars(total)}\n`)
} else {
  stderr.write('usage: expenses summary\n')
  exit(1)
}
