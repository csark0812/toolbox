import { readFileSync } from 'node:fs'
import { argv, exit } from 'node:process'
import { problemWith } from '../src/bookings.mjs'
import { loadMembers } from '../src/members.mjs'

const members = loadMembers(readFileSync(new URL('../data/members.csv', import.meta.url), 'utf8'))
const code = argv[2]
const member = members.get(code)
if (!member) {
  console.error(`No member ${code}`)
  exit(1)
}
const today = new Date().toISOString().slice(0, 10)
const problem = problemWith({ member: code, court: 1, date: today, hour: 0 }, members)
console.log(`${code}  ${member.name}  expires ${member.expires}  ${problem ?? 'can book'}`)
