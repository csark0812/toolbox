// In-memory stand-in for the audit_events table.
export function createDb() {
  return { events: [], nextId: 1 }
}

export function insertEvent(db, { at, actor, action }) {
  const event = { id: db.nextId++, at, actor, action }
  db.events.push(event)
  return event
}

/** Events strictly older than `before` (ms), oldest id first, paged. */
export function selectEvents(db, { before, offset = 0, limit = 100 }) {
  return db.events
    .filter((event) => event.at < before)
    .sort((a, b) => a.id - b.id)
    .slice(offset, offset + limit)
    .map((event) => ({ ...event }))
}

export function countEvents(db) {
  return db.events.length
}
