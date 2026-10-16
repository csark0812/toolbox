#!/usr/bin/env node
import { argv, exit, stderr, stdout } from 'node:process'
import { line, pointsPath, TEAMS } from '../src/paths.mjs'
import { roundResults } from '../src/standings.mjs'

const round = argv[2]
if (!/^\d+$/.test(round ?? '')) {
  stderr.write('usage: round <n>\n')
  exit(2)
}
try {
  stdout.write(`Round ${round}\n`)
  for (const entry of await roundResults(TEAMS, pointsPath(), round))
    stdout.write(`${line(entry)}\n`)
} catch (error) {
  stderr.write(`round: ${error.message}\n`)
  exit(1)
}
