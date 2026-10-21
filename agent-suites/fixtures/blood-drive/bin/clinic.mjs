import { readFileSync } from 'node:fs'
import { argv, exit } from 'node:process'
import { dueOn, parseHistory } from '../src/eligibility.mjs'

const read = (name) => readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8')
const history = parseHistory(read('history.csv'))
const donors = new Map(JSON.parse(read('donors.json')).map((donor) => [donor.id, donor.name]))
const session = argv[2]
const booked = JSON.parse(read('appointments.json'))[session]
if (!booked) {
  console.error(`No session on ${session}`)
  exit(1)
}
for (const { time, donor } of booked) {
  const { due, last, from } = dueOn(history, donor, session)
  const gave = last ? `last gave ${last.padEnd(10)}  due from ${from}` : 'first donation'.padEnd(41)
  console.log(
    `${time}  ${donor}  ${donors.get(donor).padEnd(12)}  ${gave}  ${due ? 'OK' : 'NOT DUE'}`,
  )
}
