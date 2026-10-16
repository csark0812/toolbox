#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { parseIsoDay } from '../src/dates.mjs'
import { parseLog } from '../src/log.mjs'
import { overdue } from '../src/overdue.mjs'

const args = argv.slice(2)
const at = args.indexOf('--today')
let today
if (at === -1) {
  const now = new Date()
  today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
} else {
  try {
    today = parseIsoDay(args[at + 1] ?? '')
  } catch (error) {
    stderr.write(`overdue: ${error.message}\n`)
    exit(2)
  }
}
const rows = parseLog(readFileSync(new URL('../data/inspections.csv', import.meta.url), 'utf8'))
const list = overdue(rows, today)
if (!list.length) stdout.write('No hives overdue.\n')
for (const hive of list)
  stdout.write(`Hive ${hive.hive}  last ${hive.last}  ${String(hive.days).padStart(3)} days\n`)
