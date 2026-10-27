import { readFileSync } from 'node:fs'
import { parseCsv, sessionProblems } from '../src/rota.mjs'

const read = (name) => parseCsv(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))
const volunteers = read('volunteers.csv')
const rota = read('rota.csv')

let flagged = 0
for (const session of rota) {
  const problems = sessionProblems(session, volunteers)
  if (problems.length) flagged++
  const label = `${session.date} ${session.time}  ${session.group.padEnd(26)}  ${session.lead.padEnd(14)}`
  console.log(`${label}  ${problems.length ? `PROBLEM: ${problems.join('; ')}` : 'ok'}`)
}
console.log(flagged ? `${flagged} sessions need sorting out` : 'The rota is clear')
