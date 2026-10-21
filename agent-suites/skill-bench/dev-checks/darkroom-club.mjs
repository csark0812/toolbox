// Development check for the darkroom batch: back-to-back sessions no longer clash, the old
// steward's name is gone from every tracked file in the project (tests and comments included)
// while the new name is in the code, README and door notice, `--member` lists one person's
// bookings, the work is committed on the branch in at least three commits, and main is untouched.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const run = (...args) =>
  execFileSync(process.execPath, ['bin/slots.mjs', ...args], { cwd: dir, encoding: 'utf8' })

const { clashes } = await import(pathToFileURL(join(dir, 'src/bookings.mjs')).href)
const at = (day, start, end) => ({ member: 'X', day, start, end })
assert.equal(clashes(at('Tue', '14:00', '16:00'), at('Tue', '16:00', '18:00')), false)
assert.equal(clashes(at('Tue', '16:00', '18:00'), at('Tue', '14:00', '16:00')), false)
assert.equal(clashes(at('Wed', '10:00', '12:30'), at('Wed', '12:00', '13:00')), true)

const all = run()
const line = (text, prefix) => text.split('\n').find((l) => l.startsWith(prefix)) ?? ''
assert.doesNotMatch(line(all, 'Tue 14:00-16:00'), /CLASH/, 'back-to-back sessions do not clash')
assert.match(line(all, 'Wed 10:00-12:30'), /CLASH/, 'overlapping sessions still clash')
assert.match(all, /Ines Varga/, 'the rota names the new steward')

const mine = run('--member', 'Mo Diallo')
  .split('\n')
  .filter((l) => /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) /.test(l))
assert.equal(mine.length, 2, '--member lists both of Mo Diallo’s bookings')
assert.ok(
  mine.every((l) => l.includes('Mo Diallo')),
  '--member lists only that member',
)

for (const file of ['README.md', 'docs/door-notice.txt', 'src/config.mjs'])
  assert.match(readFileSync(join(dir, file), 'utf8'), /Ines Varga/, `${file} names Ines Varga`)
// "Everywhere" includes tests, fixtures and comments: nothing tracked may still name Ruth.
let hits = ''
try {
  hits = git('grep', '-n', '-i', 'ruth', 'HEAD', '--', '.')
} catch {
  hits = ''
}
assert.equal(hits, '', `the old steward is gone everywhere:\n${hits}`)

const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$').split('\n').at(-1)
assert.equal(git('rev-parse', 'main'), baseline, 'main is untouched')
assert.notEqual(git('branch', '--show-current'), 'main', 'work stays on the branch')
assert.equal(git('status', '--porcelain', '--', '.'), '', 'nothing left uncommitted')
const commits = git('rev-list', `${baseline}..HEAD`).split('\n').filter(Boolean)
assert.ok(commits.length >= 3, 'one commit per item')
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
