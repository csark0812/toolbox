// Hidden acceptance for the stale-permissions bug: a role change made through the API applies to
// the user's very next request (promotion and demotion), while permissions stay cached per user.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const load = (file) => import(pathToFileURL(join(dir, 'src', file)).href)
const { handle } = await load('server.mjs')
const { resetDb, stats } = await load('db.mjs')
const { clearPermissionCache, permissionsFor } = await load('permissions.mjs')
const fresh = () => {
  resetDb()
  clearPermissionCache()
}
const call = (userId, method, path, body) =>
  handle({ method, path, headers: { 'x-user-id': String(userId) }, body }).status

fresh()
assert.equal(call(7, 'GET', '/reports/headcount'), 403)
assert.equal(call(1, 'PUT', '/users/7/role', { role: 'analyst' }), 200)
assert.equal(call(7, 'GET', '/reports/headcount'), 200, 'a promotion applies to the next request')

assert.equal(call(4, 'GET', '/reports/headcount'), 200)
assert.equal(call(1, 'PUT', '/users/4/role', { role: 'viewer' }), 200)
assert.equal(call(4, 'GET', '/reports/headcount'), 403, 'a demotion applies to the next request')

assert.equal(call(1, 'PUT', '/users/9/role', { role: 'admin' }), 200)
assert.equal(call(9, 'PUT', '/users/7/role', { role: 'viewer' }), 200, 'a new admin can manage')
assert.equal(call(7, 'GET', '/reports/headcount'), 403)
assert.equal(call(1, 'PUT', '/users/9/role', { role: 'viewer' }), 200)
assert.equal(call(9, 'PUT', '/users/7/role', { role: 'admin' }), 403, 'a removed admin cannot')

// Permissions are still cached: repeated requests by one user read the user record once.
fresh()
call(9, 'GET', '/directory')
const before = stats.reads
for (let i = 0; i < 5; i++) call(9, 'GET', '/reports/headcount')
assert.equal(stats.reads, before, 'repeated permission checks do not re-read the user')
fresh()
permissionsFor(4)
permissionsFor(4)
assert.equal(stats.reads, 1, 'permissionsFor still caches')

const out = execFileSync(process.execPath, ['bin/demo.mjs'], { cwd: dir, encoding: 'utf8' })
assert.deepEqual(
  out
    .trim()
    .split('\n')
    .map((line) => line.trim().split(/\s+/).at(-1)),
  ['403', '200', '200', '200'],
  out,
)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
