import { readFileSync } from 'node:fs'
import { importRequests } from '../src/bookings.mjs'
import { loadMembers } from '../src/members.mjs'

const members = loadMembers(readFileSync(new URL('../data/members.csv', import.meta.url), 'utf8'))
const requests = JSON.parse(readFileSync(new URL('../data/requests.json', import.meta.url), 'utf8'))
importRequests(requests, members).forEach(({ request, problem }, index) => {
  const when = `${request.date} ${String(request.hour).padStart(2, '0')}:00`
  const outcome = problem ? `refused: ${problem}` : 'booked'
  console.log(
    `${String(index + 1).padStart(2)}  ${request.member}  court ${request.court}  ${when}  ${outcome}`,
  )
})
