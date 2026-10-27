// Development check for the online-cancellation branch review: every project file is
// byte-identical, no commit was made and the branch is unchanged.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
const dir = process.argv[2]
const EXPECTED = {
  'README.md': '99216654ba5ab59c',
  'data/bookings.json': '45812347cabaee11',
  'data/courses.json': '5289feae1ced08fd',
  'package.json': '57898e9dbbf58abf',
  'src/api.mjs': 'efb99162497ce7e6',
  'src/refunds.mjs': '03864313b81f9125',
  'src/store.mjs': 'c06b1ab3e8378107',
  'tests/api.test.mjs': '3282d038f6045706',
  'tests/refunds.test.mjs': 'ef398c71d16b820d',
}
const walk = (folder) =>
  readdirSync(folder, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(folder, entry.name)) : [join(folder, entry.name)],
  )
const actual = Object.fromEntries(
  walk(dir)
    .sort()
    .map((file) => [
      relative(dir, file),
      createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 16),
    ]),
)
assert.deepEqual(actual, EXPECTED, 'no project file may be added, changed or removed')

const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
assert.equal(
  git('log', '-1', '--format=%s'),
  'feat: online cancellation with refunds',
  'no commits were added',
)
assert.equal(git('branch', '--show-current'), 'feat/online-cancel', 'still on the reviewed branch')
assert.equal(git('status', '--porcelain', '--', '.'), '', 'the work tree is clean')
