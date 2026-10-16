#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { clashWith, dayLabel, problemWith, ROOMS } from '../src/hall.mjs'

const [room, date, start, end] = argv.slice(2)
if (!end) {
  stderr.write('usage: request <room> <YYYY-MM-DD> <start> <end>\n')
  exit(2)
}
const request = { room, date, start, end }
const problem = problemWith(request)
if (problem) {
  stdout.write(`Cannot book: ${problem}\n`)
  exit(1)
}
const bookings = JSON.parse(readFileSync(new URL('../data/bookings.json', import.meta.url), 'utf8'))
const clash = clashWith(bookings, request)
if (clash) {
  stdout.write(`Clash: ${clash.hirer} has the ${ROOMS[room]} ${clash.start}-${clash.end}\n`)
  exit(1)
}
stdout.write(`Free: ${ROOMS[room]}, ${dayLabel(date)} ${start}-${end}\n`)
