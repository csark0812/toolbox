import { listUsers } from './db.mjs'
import { permissionsFor } from './permissions.mjs'
import { Forbidden, setRole } from './users.mjs'

const json = (status, body) => ({ status, body })

function requirePermission(req, permission) {
  const actor = req.headers['x-user-id']
  if (!actor) return json(401, { error: 'sign in first' })
  if (!permissionsFor(actor).has(permission)) return json(403, { error: `${permission} required` })
  return null
}

/** Handles one request: { method, path, headers, body }. */
export function handle(req) {
  if (req.method === 'GET' && req.path === '/directory') {
    return requirePermission(req, 'directory:read') ?? json(200, listUsers())
  }
  if (req.method === 'GET' && req.path === '/reports/headcount') {
    const denied = requirePermission(req, 'reports:read')
    if (denied) return denied
    const counts = {}
    for (const user of listUsers()) counts[user.role] = (counts[user.role] ?? 0) + 1
    return json(200, counts)
  }
  const roleRoute = req.path.match(/^\/users\/(\d+)\/role$/)
  if (req.method === 'PUT' && roleRoute) {
    try {
      const user = setRole(req.headers['x-user-id'], Number(roleRoute[1]), req.body?.role)
      return json(200, user)
    } catch (error) {
      if (error instanceof Forbidden) return json(403, { error: error.message })
      if (error instanceof RangeError) return json(400, { error: error.message })
      throw error
    }
  }
  return json(404, { error: 'not found' })
}
