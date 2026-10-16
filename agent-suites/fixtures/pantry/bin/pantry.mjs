#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { exit, stderr, stdout } from 'node:process'
import { parseArgs } from 'node:util'
import { listLines, totals } from '../src/pantry.mjs'

let parsed
try {
  parsed = parseArgs({ allowPositionals: true, options: { today: { type: 'string' } } })
} catch (error) {
  stderr.write(`${error.message}\n`)
  exit(2)
}
const items = JSON.parse(readFileSync(new URL('../data/pantry.json', import.meta.url), 'utf8'))
const [command] = parsed.positionals
const today = parsed.values.today ?? new Date().toISOString().slice(0, 10)
if (command === 'list') for (const line of listLines(items, today)) stdout.write(`${line}\n`)
else if (command === 'totals') for (const line of totals(items)) stdout.write(`${line}\n`)
else {
  stderr.write('usage: pantry <list|totals> [--today YYYY-MM-DD]\n')
  exit(2)
}
