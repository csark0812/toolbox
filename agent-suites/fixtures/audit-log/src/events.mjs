import { insertEvent } from './db.mjs'

const ACTIONS = new Set(['login', 'logout', 'invite', 'role-change', 'export', 'delete-project'])

export function record(db, actor, action, now = Date.now()) {
  if (!ACTIONS.has(action)) throw new RangeError(`Unknown audit action ${action}`)
  return insertEvent(db, { at: now, actor, action })
}
