#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { exit, stderr, stdout } from 'node:process'
import { parseArgs } from 'node:util'
import { formatRow, statusRows } from '../src/docks.mjs'

let parsed
try {
  parsed = parseArgs({ allowPositionals: true, options: {} })
} catch (error) {
  stderr.write(`${error.message}\n`)
  exit(2)
}
if (parsed.positionals[0] !== 'status') {
  stderr.write('usage: docks status\n')
  exit(2)
}
const docks = JSON.parse(readFileSync(new URL('../data/docks.json', import.meta.url), 'utf8'))
for (const row of statusRows(docks)) stdout.write(`${formatRow(row)}\n`)
