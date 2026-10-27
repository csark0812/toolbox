// Development check for the read-only fix-it outcome counts question: nothing in the project changed
// and no commit was made.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
const dir = process.argv[2]
const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
assert.equal(git('log', '-1', '--format=%s'), 'Fixture baseline', 'no commits were added')
assert.equal(
  git('status', '--porcelain', '--untracked-files=all', '--', '.'),
  '',
  'nothing changed',
)
