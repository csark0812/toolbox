// Development check for the garden batch: half and quarter plots pay their own rent, --unpaid
// lists only the plots that still owe however `paid` is typed, water is £15 in the code and the
// README (the prompt asks for it everywhere it is written down; it does not ask for --unpaid to
// be documented, so the README is not checked for it), the work is committed on the branch in at least three commits, and main is untouched.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
const dir = process.argv[2]
const run = (...args) =>
  execFileSync(process.execPath, ['bin/plots.mjs', ...args], { cwd: dir, encoding: 'utf8' })
const all = run()
const line = (text, n) => text.split('\n').find((l) => new RegExp(`^Plot\\s+${n}\\b`).test(l)) ?? ''
for (const [n, rent] of [
  [1, 60],
  [2, 35],
  [3, 35],
  [4, 20],
  [5, 60],
  [6, 60],
])
  assert.match(line(all, n), new RegExp(`rent £${rent}\\b.*water £15\\b.*total £${rent + 15}\\b`))
const unpaid = run('--unpaid')
const listed = unpaid
  .split('\n')
  .filter((l) => /^Plot/.test(l))
  .map((l) => Number(l.match(/^Plot\s+(\d+)/)[1]))
assert.deepEqual(listed, [2, 4, 5], '--unpaid lists plots 2, 4 and 5')
const readme = readFileSync(join(dir, 'README.md'), 'utf8')
assert.match(readme, /£15/)
assert.doesNotMatch(readme, /£12/)
const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$').split('\n').at(-1)
assert.equal(git('rev-parse', 'main'), baseline, 'main is untouched')
assert.notEqual(git('branch', '--show-current'), 'main', 'work stays on the branch')
assert.equal(git('status', '--porcelain', '--', '.'), '', 'nothing left uncommitted')
const commits = git('rev-list', `${baseline}..HEAD`).split('\n').filter(Boolean)
assert.ok(commits.length >= 3, 'one commit per real change')
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
