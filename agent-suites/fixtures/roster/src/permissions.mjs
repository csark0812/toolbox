import { createCache } from './cache.mjs'
import { getUser } from './db.mjs'

export const ROLE_PERMISSIONS = {
  viewer: ['directory:read'],
  analyst: ['directory:read', 'reports:read'],
  manager: ['directory:read', 'reports:read', 'reports:export'],
  admin: ['directory:read', 'reports:read', 'reports:export', 'users:manage'],
}

const cache = createCache()

/** The set of permissions for a user, cached until their role changes. */
export function permissionsFor(userId) {
  if (cache.has(userId)) return cache.get(userId)
  const user = getUser(userId)
  const permissions = new Set(user ? ROLE_PERMISSIONS[user.role] : [])
  cache.set(userId, permissions)
  return permissions
}

export function invalidatePermissions(userId) {
  cache.delete(userId)
}

export function clearPermissionCache() {
  cache.clear()
}
