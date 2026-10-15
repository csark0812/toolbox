import { createInvite } from './invites.mjs'

/** POST /teams/:id/invites */
export function handleCreateInvite(team, req) {
  const invite = createInvite(team, req.user, { email: req.body.email, role: req.body.role })
  return { status: 201, body: { email: invite.email, role: invite.role } }
}
