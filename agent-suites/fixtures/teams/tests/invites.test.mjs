import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createInvite } from '../src/invites.mjs'
import { createTeam } from '../src/teams.mjs'

const owner = { id: 'u1', email: 'Owner@Example.com' }

test('owners invite members and admins', () => {
  const team = createTeam('core', owner)
  const invite = createInvite(team, owner, { email: 'New@Example.com', role: 'admin' }, 0)
  assert.equal(invite.email, 'new@example.com')
  assert.equal(invite.expiresAt, 7 * 24 * 60 * 60 * 1000)
  assert.equal(team.invites.length, 1)
})

test('nobody invites an owner', () => {
  const team = createTeam('core', owner)
  assert.throws(
    () => createInvite(team, owner, { email: 'x@example.com', role: 'owner' }),
    RangeError,
  )
})
