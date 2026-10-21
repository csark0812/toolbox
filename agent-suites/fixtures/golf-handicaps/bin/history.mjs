import { readFileSync } from 'node:fs'
import { argv } from 'node:process'
import { handicapHistory } from '../src/handicap.mjs'

const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))
const rounds = read('rounds.json')
const courses = read('courses.json')
const who = (argv[2] ?? '').trim().toLowerCase()
const history = handicapHistory(rounds, courses)
rounds.forEach((round, index) => {
  if (round.player.trim().toLowerCase() !== who) return
  const value = history[index].index
  const shown = value === null ? '-' : (value / 10).toFixed(1)
  console.log(
    `${round.date}  ${round.id}  ${round.course.padEnd(10)}${String(round.gross).padStart(4)}  index ${shown}`,
  )
})
