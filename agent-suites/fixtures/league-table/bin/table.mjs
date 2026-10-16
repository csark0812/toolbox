#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { standingsAfter } from '../src/standings.mjs'

const args = argv.slice(2)
const file = args[0]
const roundAt = args.indexOf('--round')
const season = file && JSON.parse(readFileSync(file, 'utf8'))
const round =
  roundAt === -1
    ? Math.max(0, ...(season?.fixtures ?? []).map((f) => f.round))
    : Number(args[roundAt + 1])
if (!season || !Number.isInteger(round) || round < 0) {
  stderr.write('usage: table <season.json> [--round <n>]\n')
  exit(2)
}
stdout.write('Pos  Team              P  W  D  L   GF  GA  GD  Pts\n')
for (const r of standingsAfter(season, round))
  stdout.write(
    `${String(r.position).padStart(3)}  ${r.team.padEnd(16)} ${[r.played, r.won, r.drawn, r.lost].map((n) => String(n).padStart(2)).join(' ')}  ${[r.goalsFor, r.goalsAgainst, r.goalDifference].map((n) => String(n).padStart(3)).join(' ')}  ${String(r.points).padStart(3)}\n`,
  )
