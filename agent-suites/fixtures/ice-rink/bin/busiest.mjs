import { argv } from 'node:process'
import { withRetry } from '../src/retry.mjs'
import { fullness, loadSessions } from '../src/sessions.mjs'

const path = argv[2] ?? 'data/sessions.json'
withRetry(loadSessions, 3, 50, path, (error, sessions) => {
  if (error) {
    console.error(`Could not read ${path}: ${error.code ?? error.message}`)
    process.exitCode = 1
    return
  }
  const busiest = [...sessions].sort(
    (a, b) => fullness(b) - fullness(a) || (a.id < b.id ? -1 : 1),
  )[0]
  console.log(
    `Busiest: ${busiest.date} ${busiest.start} ${busiest.type}, ${fullness(busiest)}% full`,
  )
})
