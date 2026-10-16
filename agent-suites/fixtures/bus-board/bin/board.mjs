#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { departures, when } from '../src/board.mjs'

const args = argv.slice(2)
const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))
const stop = read('stops.json').find((s) => s.id === args[0])
const now = args[args.indexOf('--at') + 1]
if (!stop || !args.includes('--at') || !/^\d{2}:\d{2}$/.test(now ?? '')) {
  stderr.write('usage: board <stop id> --at <HH:MM>\n')
  exit(2)
}
stdout.write(`${stop.name}  ${now}\n`)
for (const d of departures(stop, read('timetable.json'), now))
  stdout.write(`  ${d.route.padEnd(3)} ${d.to.padEnd(12)} ${when(d).padStart(6)}\n`)
