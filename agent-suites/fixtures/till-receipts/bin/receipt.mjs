#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { receiptLines } from '../src/receipt.mjs'

const file = argv[2]
if (!file) {
  stderr.write('usage: receipt <sale.json>\n')
  exit(2)
}
const sale = JSON.parse(readFileSync(file, 'utf8'))
for (const line of receiptLines(sale)) stdout.write(`${line}\n`)
