import { verifyPassword } from './users.mjs'

/** POST /login */
export async function login(req, { users }) {
  const email = String(req.body.email ?? '')
    .trim()
    .toLowerCase()
  const user = users.findByEmail(email)
  const ok = user && (await verifyPassword(String(req.body.password ?? ''), user.hash))
  if (!ok) return { status: 401, body: { error: 'wrong email or password' } }
  return { status: 200, body: { userId: user.id } }
}
