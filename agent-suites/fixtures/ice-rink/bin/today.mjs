import { argv } from 'node:process'
import { fullness, loadSessions } from '../src/sessions.mjs'

const path = argv[2] ?? 'data/sessions.json'
const day = argv[3] ?? '2026-11-07'
loadSessions(path, (error, sessions) => {
  if (error) {
    console.error(`Could not read ${path}: ${error.code ?? error.message}`)
    process.exitCode = 1
    return
  }
  const list = sessions.filter((session) => session.date === day)
  if (!list.length) console.log(`No sessions on ${day}.`)
  for (const session of list)
    console.log(
      `${session.start}-${session.end}  ${session.type.padEnd(14)}${String(session.booked).padStart(4)}/${session.capacity}  ${fullness(session)}%`,
    )
})
