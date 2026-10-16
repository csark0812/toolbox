#!/usr/bin/env node
import { exit, stderr, stdout } from 'node:process'
import { line, pointsPath, TEAMS } from '../src/paths.mjs'
import { totals } from '../src/standings.mjs'

try {
  for (const entry of await totals(TEAMS, pointsPath())) stdout.write(`${line(entry)}\n`)
} catch (error) {
  stderr.write(`leaderboard: ${error.message}\n`)
  exit(1)
}
