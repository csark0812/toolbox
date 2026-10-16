#!/usr/bin/env node
import { argv, exit, stderr, stdout } from 'node:process'
import { reminderFor } from '../src/notify.mjs'
import { sweep } from '../src/overdue.mjs'
import { isActive, report } from '../src/report.mjs'
import { loadLoans } from '../src/store.mjs'

const args = argv.slice(2)
const option = (name) => {
  const index = args.indexOf(name)
  return index === -1 ? undefined : args[index + 1]
}
const today = option('--today') ?? new Date().toISOString().slice(0, 10)
const loans = loadLoans(new URL('../data/loans.json', import.meta.url))
sweep(loans, today)

const command = args[0]
if (command === 'report') stdout.write(report(loans, today) + '\n')
else if (command === 'overdue') {
  for (const loan of loans) {
    const message = reminderFor(loan)
    if (message) stdout.write(`${loan.memberId}: ${message}\n`)
  }
} else if (command === 'list') {
  const status = option('--status')
  if (status && !['out', 'overdue', 'lost', 'returned'].includes(status)) {
    stderr.write(`unknown status ${status}\n`)
    exit(1)
  }
  for (const loan of loans.filter((l) => (status ? l.status === status : isActive(l))))
    stdout.write(`${loan.id} ${loan.bookId.padEnd(8)} ${loan.status.padEnd(8)} due ${loan.dueOn}\n`)
} else {
  stderr.write('usage: loans report|overdue|list [--status <status>] [--today YYYY-MM-DD]\n')
  exit(1)
}
