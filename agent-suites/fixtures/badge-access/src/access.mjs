import { audit } from './audit.mjs'

/** Whether a badge opens a door: not revoked, and the door's zone is one of the badge's zones. */
export function canOpen(badge, door) {
  if (badge.revoked) return false
  return badge.zones.includes(door.zone)
}

/** Decide a swipe and record it in the audit trail. */
export function checkDoor(badge, door, now = new Date()) {
  const allowed = canOpen(badge, door, now)
  audit.emit(allowed ? 'granted' : 'denied', {
    badge: badge.id,
    door: door.id,
    at: now.toISOString(),
  })
  return allowed
}
