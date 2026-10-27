import { readFileSync } from 'node:fs'
import { argv } from 'node:process'
import { allocate, RINKS, SESSIONS } from '../src/rinks.mjs'

const requests = JSON.parse(readFileSync(new URL('../data/requests.json', import.meta.url), 'utf8'))
const date = argv[2]
const results = allocate(requests.filter((request) => request.date === date))
for (const session of SESSIONS) {
  const rinks = Array.from({ length: RINKS }, (_, i) => {
    const given = results.find(
      ({ request, problem }) => !problem && request.session === session && request.rink === i + 1,
    )
    return `${i + 1}: ${given ? given.request.team : '-'}`
  })
  console.log(`${session.padEnd(9)}  ${rinks.join('  ')}`)
}
for (const { request, problem } of results.filter((result) => result.problem))
  console.log(`turned down: ${request.team}, rink ${request.rink} ${request.session} (${problem})`)
