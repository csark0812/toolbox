#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { createPool } from '../src/pool.mjs'

const file = argv[2]
if (!file) {
  stderr.write('usage: apply <changes.json>\n')
  exit(2)
}
const changes = JSON.parse(readFileSync(file, 'utf8'))
const pool = createPool()
const slot = (hour) => `${String(hour).padStart(2, '0')}:00`
const days = new Set()
for (const change of changes) {
  if (change.op === 'book') {
    days.add(change.day)
    const result = pool.book(change)
    const what = `${change.id} ${change.club} lane ${change.lane} ${slot(change.hour)}`
    stdout.write(result.ok ? `booked    ${what}\n` : `refused   ${what}: ${result.reason}\n`)
  } else if (change.op === 'cancel') {
    stdout.write(
      pool.cancel(change.id) ? `cancelled ${change.id}\n` : `unknown   ${change.id}: no booking\n`,
    )
  }
}
for (const day of [...days].sort()) {
  stdout.write(`\nFree on ${day}\n`)
  for (const { lane, hours } of pool.free(day))
    stdout.write(`  Lane ${lane}  ${hours.length ? hours.map(slot).join(' ') : 'full'}\n`)
}
