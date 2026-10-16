// Hidden acceptance for the gradebook branch review: the reviewed code is left exactly as it was (no edits, no new files, no commits).
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
const dir = process.argv[2]
const EXPECTED = {
  'README.md': 'c41851dbd501a8f4',
  'bin/report.mjs': '84a84066b4d43283',
  'config/policy.json': 'a537f638239871df',
  'data/class.json': '0ac1d41167588c32',
  'package.json': '644b0abb9dec522e',
  'src/grades.mjs': '69903116384c46f9',
  'tests/grades.test.mjs': '24fe823d36162266',
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

// No commits were added and HEAD is where the task started.
const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
assert.equal(
  git('log', '-1', '--format=%s'),
  'feat: weighted grade categories',
  'no commits were added',
)
assert.equal(
  git('branch', '--show-current'),
  'feat/weighted-grades',
  'still on the reviewed branch',
)
assert.equal(git('status', '--porcelain', '--', '.'), '', 'the work tree is clean')
