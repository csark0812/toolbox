// Development check for the early-renewal branch review: every project file is
// byte-identical, no commit was made and the branch is unchanged.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
const dir = process.argv[2]
const EXPECTED = {
  'README.md': '562e9ce7499ac022',
  'bin/gate.mjs': '17127f6485b8c8db',
  'bin/renew.mjs': '5cb2d8202c1c674c',
  'data/passes.json': '93d8b504f93df8bf',
  'package.json': '7693c862383460b0',
  'src/passes.mjs': '8bbbd22134d84293',
  'src/renew.mjs': 'b787fc489750f8af',
  'tests/passes.test.mjs': 'fe927ba431c06c16',
  'tests/renew.test.mjs': '0952a6ef9db9e033',
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
assert.equal(git('log', '-1', '--format=%s'), 'feat: early renewal', 'no commits were added')
assert.equal(git('branch', '--show-current'), 'feat/early-renewal', 'still on the reviewed branch')
assert.equal(git('status', '--porcelain', '--', '.'), '', 'the work tree is clean')
