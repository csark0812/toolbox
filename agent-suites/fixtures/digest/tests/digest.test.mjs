import assert from 'node:assert/strict'
import { test } from 'node:test'
import { dueUsers, plan } from '../src/digest.mjs'

const now = Date.parse('2026-10-12T00:00:00Z')
const user = (id, extra) => ({ id, timezone: null, prefs: { digest: true }, ...extra })

test('due after a week, not before', () => {
  const users = [
    user('a', { lastSentAt: '2026-10-05T00:00:00Z' }),
    user('b', { lastSentAt: '2026-10-06T00:00:00Z' }),
  ]
  assert.deepEqual(
    dueUsers(users, now).map((u) => u.id),
    ['a'],
  )
})

test('respects opt-out', () => {
  assert.deepEqual(
    dueUsers([user('a', { lastSentAt: '2026-01-01T00:00:00Z', prefs: { digest: false } })], now),
    [],
  )
})

test('sends at 08:00 local', () => {
  const [entry] = plan(
    [user('a', { lastSentAt: '2026-10-01T00:00:00Z', timezone: 'Europe/Berlin' })],
    now,
  )
  assert.equal(entry.sendAt, '2026-10-12T06:00:00.000Z')
})
