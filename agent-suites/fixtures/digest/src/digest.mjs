import { sendAtUtc } from './schedule.mjs'

const DAY_MS = 24 * 60 * 60 * 1000
const INTERVAL_DAYS = 7

export function daysSince(iso, now) {
  return (now - Date.parse(iso)) / DAY_MS
}

/** Users who are opted in and have not had a digest for at least a week. */
export function dueUsers(users, now) {
  return users.filter(
    (user) => user.prefs.digest !== false && daysSince(user.lastSentAt, now) >= INTERVAL_DAYS,
  )
}

/** The send plan: one entry per due user, with the UTC instant to send at. */
export function plan(users, now) {
  return dueUsers(users, now).map((user) => ({
    id: user.id,
    sendAt: sendAtUtc(user.timezone ?? 'UTC', now),
  }))
}
