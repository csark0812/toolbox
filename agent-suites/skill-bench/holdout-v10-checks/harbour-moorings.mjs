// Hidden acceptance for the read-only mooring inspection question: every project file is byte-identical and no commit was made.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
const dir = process.argv[2]
const EXPECTED = {
  'README.md': '0185e44c30c5ad74',
  'bin/due.mjs': 'bc7566700c396dcb',
  'data/dives.csv': '8066bd05eb70a78d',
  'data/lifts.csv': '7240348f3f9ffeda',
  'data/moorings.csv': '16161540f2c7638f',
  'package.json': '75a900cdc02013cd',
  'src/dates.mjs': '505cd59e7fee2c51',
  'src/moorings.mjs': 'e8a2e6c8a119b858',
  'tests/moorings.test.mjs': '07291d3dad1a27a2',
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
assert.equal(git('branch', '--show-current'), 'main', 'still on main')
assert.equal(git('status', '--porcelain', '--', '.'), '', 'the work tree is clean')
