import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { resetDb } from '../src/db.mjs'
import { clearPermissionCache } from '../src/permissions.mjs'
import { handle } from '../src/server.mjs'

beforeEach(() => {
  resetDb()
  clearPermissionCache()
})

const get = (userId, path) => handle({ method: 'GET', path, headers: { 'x-user-id': userId } })

test('needs a signed-in caller', () => {
  assert.equal(handle({ method: 'GET', path: '/directory', headers: {} }).status, 401)
})

test('viewers read the directory but not reports', () => {
  assert.equal(get('9', '/directory').status, 200)
  assert.equal(get('9', '/reports/headcount').status, 403)
})

test('managers see the headcount by role', () => {
  const res = get('4', '/reports/headcount')
  assert.equal(res.status, 200)
  assert.deepEqual(res.body, { admin: 1, manager: 1, viewer: 2 })
})
