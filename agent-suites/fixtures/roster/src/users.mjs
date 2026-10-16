import { getUser, updateUser } from './db.mjs'
import { invalidatePermissions, permissionsFor, ROLE_PERMISSIONS } from './permissions.mjs'

export class Forbidden extends Error {}

/** Changes a user's role. Only callers with users:manage may do this. */
export function setRole(actorId, targetId, role) {
  if (!permissionsFor(actorId).has('users:manage')) throw new Forbidden('users:manage required')
  if (!(role in ROLE_PERMISSIONS)) throw new RangeError(`Unknown role ${role}`)
  if (!getUser(targetId)) throw new RangeError(`No user ${targetId}`)
  const user = updateUser(targetId, { role })
  invalidatePermissions(user.id)
  return user
}
