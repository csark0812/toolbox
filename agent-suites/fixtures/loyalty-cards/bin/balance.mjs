#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { exit, stderr, stdout } from 'node:process'
import { parseArgs } from 'node:util'
import { replay } from '../src/points.mjs'

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { on: { type: 'string' } },
})
const customers = JSON.parse(
  readFileSync(new URL('../data/customers.json', import.meta.url), 'utf8'),
)
const card = customers[positionals[0]]
if (!card) {
  stderr.write('usage: balance <card> [--on YYYY-MM-DD]\n')
  exit(2)
}
const on = values.on ?? new Date().toISOString().slice(0, 10)
const { balance, history } = replay(card.events, on)
stdout.write(`${card.name} (${positionals[0]})\n`)
for (const entry of history)
  stdout.write(`  ${entry.date}  ${entry.type.padEnd(8)} ${String(entry.points).padStart(4)}\n`)
stdout.write(`balance on ${on}: ${balance} points\n`)
