#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { money, quote } from '../src/quote.mjs'

const [roomId, players, date] = argv.slice(2)
const rooms = JSON.parse(readFileSync(new URL('../data/rooms.json', import.meta.url), 'utf8'))
const room = rooms[roomId]
if (!room || !/^\d+$/.test(players ?? '') || !/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) {
  stderr.write(`usage: quote <${Object.keys(rooms).join('|')}> <players> <YYYY-MM-DD>\n`)
  exit(2)
}
try {
  const { lines, total } = quote(room, Number(players), date)
  stdout.write(`${room.name} for ${players}, ${date}\n`)
  for (const line of lines)
    stdout.write(`  ${line.label.padEnd(28)}${money(line.pence).padStart(9)}\n`)
  stdout.write(`  ${'Total'.padEnd(28)}${money(total).padStart(9)}\n`)
} catch (error) {
  stderr.write(`quote: ${error.message}\n`)
  exit(2)
}
