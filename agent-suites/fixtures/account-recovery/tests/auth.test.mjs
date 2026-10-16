import assert from 'node:assert/strict'
import { test } from 'node:test'
import { login } from '../src/auth.mjs'
import { createUsers } from '../src/users.mjs'

test('signs in with the right password', async () => {
  const users = createUsers()
  await users.add({ id: 'u1', email: 'Ana@Example.com', password: 'correct horse battery' })
  const ok = await login(
    { body: { email: 'ana@example.com', password: 'correct horse battery' }, headers: {} },
    { users },
  )
  assert.deepEqual(ok, { status: 200, body: { userId: 'u1' } })
  const bad = await login(
    { body: { email: 'ana@example.com', password: 'nope' }, headers: {} },
    { users },
  )
  assert.equal(bad.status, 401)
})
