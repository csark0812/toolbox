// Hidden acceptance for the read-only webhooks question: every project file is byte-identical and no commit was made.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
const dir = process.argv[2]
const EXPECTED = {
  'README.md': '160c96e3d936b24b',
  'bin/replay.mjs': '7d7a6f7b72c84e8d',
  'config/webhooks.json': '9d043ce6d3dcff93',
  'data/deliveries.log': '79889cc086f6284d',
  'data/responses.json': 'caf65932afa0345e',
  'package.json': '0952e0de808525ae',
  'src/backoff.mjs': '5308aecf6120e593',
  'src/deliver.mjs': '2c0fa2c3adfa0c0c',
  'tests/deliver.test.mjs': '71d3f1fce3f24a6d',
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
