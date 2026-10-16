// Hidden acceptance for the seats branch review: the reviewed code is left exactly as it was (no edits, no new files, no commits).
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
const dir = process.argv[2]
const EXPECTED = {
  'README.md': '7d51eabdc35bdac6',
  'package.json': '4adc04423960e937',
  'src/payments.mjs': 'dd6c9530f88a3a4f',
  'src/reservations.mjs': '8c1e81f082cb56c1',
  'src/routes.mjs': 'a2f6ecffc2494ecb',
  'src/shows.mjs': 'a3078154edf87205',
  'src/store.mjs': 'ba491807ef94a7a9',
  'tests/reservations.test.mjs': '1e586be7eeed91e2',
  'tests/shows.test.mjs': '4ccfef7d9b65b631',
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
  'feat: seat reservations and ticket downloads',
  'no commits were added',
)
assert.equal(git('branch', '--show-current'), 'feat/reservations', 'still on the reviewed branch')
assert.equal(git('status', '--porcelain', '--', '.'), '', 'the work tree is clean')
