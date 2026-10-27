// Hidden acceptance for the read-only tree barriers question: every project file is byte-identical and no commit was made.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
const dir = process.argv[2]
const EXPECTED = {
  'README.md': '779dd0ebad71029f',
  'bin/fencing.mjs': '1704828fd5f9a1f4',
  'data/surveys.csv': '2b37e3e9c29d51e4',
  'data/trees.csv': '54171757907f5a90',
  'package.json': '7457126c4050fda7',
  'src/trees.mjs': 'bd7ffa52c7d7df46',
  'tests/trees.test.mjs': '099f416037f81e2e',
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
