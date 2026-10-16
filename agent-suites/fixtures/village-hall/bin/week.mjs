#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { dayLabel, ROOMS, weekOf } from '../src/hall.mjs'

const monday = argv[2]
if (
  !/^\d{4}-\d{2}-\d{2}$/.test(monday ?? '') ||
  new Date(`${monday}T00:00:00Z`).getUTCDay() !== 1
) {
  stderr.write('usage: week <YYYY-MM-DD of a Monday>\n')
  exit(2)
}
const bookings = JSON.parse(readFileSync(new URL('../data/bookings.json', import.meta.url), 'utf8'))
const days = weekOf(monday)
stdout.write(`Week of ${dayLabel(monday)}\n`)
for (const [room, name] of Object.entries(ROOMS)) {
  stdout.write(`${name}\n`)
  const list = bookings
    .filter((booking) => booking.room === room && days.includes(booking.date))
    .sort((a, b) => (a.date + a.start < b.date + b.start ? -1 : 1))
  if (!list.length) stdout.write('  (no bookings)\n')
  for (const booking of list)
    stdout.write(
      `  ${dayLabel(booking.date).padEnd(12)}${booking.start}-${booking.end}  ${booking.hirer}\n`,
    )
}
