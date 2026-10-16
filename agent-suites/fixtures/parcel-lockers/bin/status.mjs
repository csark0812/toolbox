#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { hoursIn, occupied } from '../src/lockers.mjs'

const args = argv.slice(2)
const at = args[args.indexOf('--at') + 1]
if (!args.includes('--at') || Number.isNaN(Date.parse(at ?? ''))) {
  stderr.write('usage: status --at <time>\n')
  exit(2)
}
const parcels = JSON.parse(readFileSync(new URL('../data/parcels.json', import.meta.url), 'utf8'))
const here = occupied(parcels, at)
for (const p of here) {
  const line = `${p.locker}  ${p.id}  ${p.recipient.padEnd(10)} ${String(hoursIn(p, at)).padStart(3)} h`
  stdout.write(`${line}\n`)
}
if (!here.length) stdout.write('all lockers empty\n')
