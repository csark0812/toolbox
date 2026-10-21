import { readFile } from 'node:fs'

const normalise = (session) => ({ ...session, type: session.type.trim().toLowerCase() })

/** Reads the box office export and calls back with (error, sessions). */
export function loadSessions(path, callback) {
  readFile(path, 'utf8', (error, text) => {
    if (error) return callback(error)
    let sessions
    try {
      sessions = JSON.parse(text).map(normalise)
    } catch (parseError) {
      return callback(parseError)
    }
    callback(null, sessions)
  })
}

/** How full a session is, as a whole percentage. */
export const fullness = (session) => Math.round((session.booked / session.capacity) * 100)
