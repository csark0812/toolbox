import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { resetDb, stats } from '../src/db.mjs'
import { clearPermissionCache, permissionsFor } from '../src/permissions.mjs'
import { Forbidden, setRole } from '../src/users.mjs'

beforeEach(() => {
  resetDb()
  clearPermissionCache()
})

test('looks permissions up once per user', () => {
  assert.ok(permissionsFor(4).has('reports:export'))
  permissionsFor(4)
  permissionsFor(4)
  assert.equal(stats.reads, 1)
})

test('a role change applies to the next lookup', () => {
  assert.equal(permissionsFor(9).has('reports:read'), false)
  setRole(1, 9, 'analyst')
  assert.equal(permissionsFor(9).has('reports:read'), true)
})

test('only admins change roles', () => {
  assert.throws(() => setRole(4, 9, 'admin'), Forbidden)
  assert.throws(() => setRole(1, 9, 'superuser'), RangeError)
})
