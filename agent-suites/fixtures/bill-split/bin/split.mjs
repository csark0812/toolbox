#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { formatCents } from '../src/money.mjs'
import { billTotal, splitBill } from '../src/split.mjs'

const file = argv[2]
if (!file) {
  stderr.write('usage: npm run split -- <bill.json>\n')
  exit(1)
}
const bill = JSON.parse(readFileSync(file, 'utf8'))
const shares = splitBill(bill)
const width = Math.max(...shares.map(({ person }) => person.length))
for (const { person, cents } of shares)
  stdout.write(`${person.padEnd(width)}  ${formatCents(cents)}\n`)
const charged = shares.reduce((sum, { cents }) => sum + cents, 0)
stdout.write(`total ${formatCents(charged)} (bill ${formatCents(billTotal(bill))})\n`)
