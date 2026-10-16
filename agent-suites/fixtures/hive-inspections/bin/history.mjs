#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { parseLog } from '../src/log.mjs'
import { history } from '../src/overdue.mjs'

const hive = argv[2]
if (!hive) {
  stderr.write('usage: history <hive>\n')
  exit(2)
}
const rows = parseLog(readFileSync(new URL('../data/inspections.csv', import.meta.url), 'utf8'))
const list = history(rows, hive)
if (!list.length) {
  stderr.write(`history: no inspections of hive ${hive}\n`)
  exit(1)
}
for (const row of list)
  stdout.write(
    `${row.date}  ${row.inspector.padEnd(6)}  queen ${row.queenSeen ? 'seen' : 'not seen'}\n`,
  )
