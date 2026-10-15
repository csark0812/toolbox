import { randomBytes } from 'node:crypto'
import { memberOf } from './teams.mjs'

export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000

/** Creates an invite. Only owners and admins may invite, and never as owner. */
export function createInvite(team, inviter, { email, role = 'member' }, now = Date.now()) {
  const member = memberOf(team, inviter.id)
  if (!member || member.role === 'member') throw new Error('Not allowed to invite')
  if (!['member', 'admin'].includes(role)) throw new RangeError(`Cannot invite as ${role}`)
  const invite = {
    token: randomBytes(16).toString('hex'),
    email: email.toLowerCase(),
    role,
    expiresAt: now + INVITE_TTL_MS,
    acceptedAt: null,
  }
  team.invites.push(invite)
  return invite
}
