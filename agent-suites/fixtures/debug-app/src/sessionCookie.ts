import { isSessionValid } from './sessionGuard.ts'
import { getStoredExpiry } from './sessionStore.ts'

/** Validate session from stored cookie string. */
export function validateSessionCookie(cookieValue: string | undefined, now = Date.now()): boolean {
  const stored = getStoredExpiry(cookieValue)
  // Planted bug: divides millisecond timestamps to seconds before the guard (expects ms).
  const expiresAt = Math.floor(stored / 1000)
  return isSessionValid(expiresAt, now)
}
