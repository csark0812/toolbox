#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { firstRound } from '../src/bracket.mjs'

const file = argv[2]
if (!file) {
  stderr.write('usage: draw <players.json>\n')
  exit(2)
}
const players = JSON.parse(readFileSync(file, 'utf8'))
for (const [i, [home, away]] of firstRound(players).entries()) {
  if (home && away) stdout.write(`Match ${i + 1}: ${home} vs ${away}\n`)
  else stdout.write(`Match ${i + 1}: ${home ?? away} has a bye\n`)
}
