// Hidden acceptance for the scheme import review: every project file is byte-identical and no commit was made.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
const dir = process.argv[2]
const EXPECTED = {
  'README.md': '076a6443bc1c32b6',
  'bin/import.mjs': 'a25cc0c9a4a94a5b',
  'bin/report.mjs': '58f5d816081d31de',
  'data/birds.json': '1c26d0b59f908acc',
  'data/encounters.json': 'da07e8da9f8a989c',
  'data/sites.json': '3e8e862ed4c4fb41',
  'data/species.json': 'ee42dd0cf4937e1b',
  'package.json': '3ae70a91e70601fd',
  'src/encounters.mjs': 'ce0a6ac10f6a432a',
  'src/import.mjs': 'b0637b0fff4e1112',
  'src/report.mjs': 'e6901092b5b7caab',
  'src/store.mjs': '67a53b64e6788849',
  'tests/encounters.test.mjs': '2e8046721ce74830',
  'tests/import.test.mjs': 'a5e9a110849360e1',
  'tests/report.test.mjs': '09b69902a2f4c69a',
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
assert.equal(git('log', '-1', '--format=%s'), 'Fixture baseline', 'no commits were added')
assert.equal(git('branch', '--show-current'), 'main', 'still on the reviewed branch')

// The uncommitted change is still there, uncommitted, staged or not.
const pending = [
  ...new Set([
    ...git('diff', 'HEAD', '--name-only', '--relative').split('\n'),
    ...git('ls-files', '--others', '--exclude-standard').split('\n'),
  ]),
]
  .filter(Boolean)
  .sort()
assert.deepEqual(
  pending,
  [
    'README.md',
    'bin/import.mjs',
    'package.json',
    'src/encounters.mjs',
    'src/import.mjs',
    'src/report.mjs',
    'tests/import.test.mjs',
    'tests/report.test.mjs',
  ],
  'the uncommitted change is left as it was',
)
assert.equal(git('stash', 'list'), '', 'nothing was stashed away')
