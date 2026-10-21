import { readFileSync } from 'node:fs'
import { standings } from '../src/league.mjs'

const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))
standings(read('teams.json'), read('nights.json')).forEach((row, i) =>
  console.log(
    `${String(i + 1).padStart(2)}  ${row.team.padEnd(24)} ${String(row.points).padStart(3)} pts  ${String(row.quiz).padStart(6)} quiz  ${row.wins} wins  (${row.played} played)`,
  ),
)
