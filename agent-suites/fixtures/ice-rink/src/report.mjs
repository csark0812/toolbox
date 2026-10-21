import { promisify } from 'node:util'
import { loadSessions } from './sessions.mjs'

const load = promisify(loadSessions)

/** Booked places and capacity by session type, busiest type first. */
export async function weeklyReport(path) {
  const sessions = await load(path)
  const byType = new Map()
  for (const session of sessions) {
    const entry = byType.get(session.type) ?? { type: session.type, booked: 0, capacity: 0 }
    entry.booked += session.booked
    entry.capacity += session.capacity
    byType.set(session.type, entry)
  }
  return [...byType.values()].sort((a, b) => b.booked - a.booked)
}
