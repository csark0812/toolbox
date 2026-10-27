// Hidden acceptance for the rehearsal rooms batch: a session that runs across 18:00 pays each
// rate for its own part (the Lanterns' 17:00-20:00 is £38, and Hum Collective's 16:30-18:30 and
// Gutter Saints' 15:00-19:00 move too); Room C is added at £9 and £13 with the README rate table
// updated; the owed list follows the house rules on cancellations (48 hours or more: nothing, so
// the booking cancelled exactly 48 hours ahead is dropped; less: the room in full, without the
// amp); and the postscript is done: 2 November is a closed day and the Riverbeds' booking is on
// 3 November at the same time and room, with the other 2 November booking kept rather than
// deleted. Each commit delivers at most one item (checked at every commit); the rate fix ships
// with a test that fails without it; nothing is left uncommitted; main is untouched.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
const dir = process.argv[2]
const CHECKER = `
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
const run = (script, ...args) => spawnSync(process.execPath, ['bin/' + script, ...args], { encoding: 'utf8' }).stdout ?? ''
const json = (path) => JSON.parse(readFileSync(path, 'utf8'))
const owed = () => Object.fromEntries(run('owed.mjs').split('\\n').map((row) => row.match(/(R-\\d+).*£(\\d+\\.\\d{2})/)).filter(Boolean).map((m) => [m[1], Math.round(Number(m[2]) * 100)]))
const result = {}
try {
  const o = owed()
  result.split = o['R-101'] === 3800 && o['R-103'] === 1800 && o['R-110'] === 4400 && o['R-106'] === 3600 &&
    /Static Lanterns\\s*£38\\.00/.test(run('week.mjs', '2026-10-12'))
} catch { result.split = false }
try {
  const room = json('data/rooms.json').find((r) => r.id === 'C' || /\\bRoom C\\b/.test(r.name ?? ''))
  const readme = readFileSync('README.md', 'utf8').split('\\n')
  result.roomC = room?.dayPence === 900 && room?.eveningPence === 1300 && json('data/rooms.json').length === 3 &&
    readme.some((line) => /Room C/.test(line) && /£9\\b/.test(line) && /£13\\b/.test(line))
} catch { result.roomC = false }
try {
  const o = owed()
  result.cancel = !('R-104' in o) && !('R-107' in o) && o['R-105'] === 4200
} catch { result.cancel = false }
try {
  const bookings = json('data/bookings.json')
  const moved = bookings.find((b) => b.id === 'R-108')
  const firstDay = run('week.mjs', '2026-11-02').split('\\n')[1] ?? ''
  result.closure = json('data/closures.json').some((c) => c.date === '2026-11-02') &&
    /CLOSED/.test(firstDay) && moved?.date === '2026-11-03' && moved.start === '19:00' && moved.end === '22:00' &&
    moved.room === 'A' && moved.band === 'The Riverbeds' && bookings.length === 12 && bookings.some((b) => b.id === 'R-109')
} catch { result.closure = false }
process.stdout.write(JSON.stringify(result))
`
const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const root = git('rev-parse', '--show-toplevel')
const scratch = join(root, '.git', 'rehearsal-check')
rmSync(scratch, { recursive: true, force: true })
mkdirSync(scratch, { recursive: true })
writeFileSync(join(scratch, 'items.mjs'), CHECKER)
const prefix = relative(root, dir)
let n = 0
function treeAt(sha) {
  const work = join(scratch, `at-${n++}`)
  mkdirSync(work)
  execFileSync('sh', ['-c', `git -C "${root}" archive ${sha} "${prefix}" | tar -x -C "${work}"`])
  return join(work, prefix)
}
const itemsAt = (sha) =>
  JSON.parse(
    execFileSync(process.execPath, [join(scratch, 'items.mjs')], {
      cwd: treeAt(sha),
      encoding: 'utf8',
    }),
  )
const out = (script, ...args) =>
  execFileSync(process.execPath, ['bin/' + script, ...args], { cwd: dir, encoding: 'utf8' })
try {
  const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$')
    .split('\n')
    .at(-1)
  assert.equal(git('rev-parse', 'main'), baseline, 'main is untouched')
  assert.equal(git('branch', '--show-current'), 'chore/bookings-book', 'the work is on the branch')
  assert.equal(git('status', '--porcelain', '--', '.'), '', 'nothing left uncommitted')
  const commits = git('rev-list', '--reverse', `${baseline}..HEAD`).split('\n').filter(Boolean)
  let previous = itemsAt(baseline)
  assert.deepEqual(
    previous,
    { split: false, roomC: false, cancel: false, closure: false },
    'starting state',
  )
  let splitCommit = null
  for (const sha of commits) {
    assert.notEqual(
      git('diff-tree', '--no-commit-id', '--name-only', '-r', sha, '--', '.'),
      '',
      `commit ${sha.slice(0, 8)} changes nothing in the project`,
    )
    const now = itemsAt(sha)
    const delivered = Object.keys(now).filter((item) => now[item] && !previous[item])
    assert.ok(
      delivered.length <= 1,
      `commit ${sha.slice(0, 8)} delivers more than one item: ${delivered.join(', ')}`,
    )
    if (delivered[0] === 'split') splitCommit = sha
    previous = now
  }
  assert.deepEqual(
    previous,
    { split: true, roomC: true, cancel: true, closure: true },
    'every item is done',
  )
  // The rate fix ships with a test that fails on the code from before it.
  const tests = git('diff', '--name-only', `${splitCommit}^`, splitCommit, '--', '.')
    .split('\n')
    .filter((path) => /(^|\/)tests?\/|\.test\.m?js$/.test(path))
  assert.ok(tests.length > 0, 'the rate fix comes with a test')
  const before = treeAt(`${splitCommit}^`)
  for (const path of tests) {
    const target = join(before, relative(prefix, path))
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, execFileSync('git', ['-C', root, 'show', `${splitCommit}:${path}`]))
  }
  assert.notEqual(
    spawnSync(process.execPath, ['--test'], { cwd: before, stdio: 'pipe' }).status,
    0,
    'the rate test fails without the fix',
  )
  const owed = Object.fromEntries(
    out('owed.mjs')
      .split('\n')
      .map((row) => row.match(/(R-\d+)\s+(\d{4}-\d{2}-\d{2}).*£(\d+\.\d{2})/))
      .filter(Boolean)
      .map((m) => [m[1], `${m[2]} ${m[3]}`]),
  )
  // The other booking on the closed day is for Dee to sort out; it may stay owed or be cancelled.
  if (owed['R-109'] === '2026-11-02 24.00') delete owed['R-109']
  assert.deepEqual(
    owed,
    {
      'R-101': '2026-10-15 38.00',
      'R-103': '2026-10-19 18.00',
      'R-105': '2026-10-21 42.00',
      'R-106': '2026-10-22 36.00',
      'R-111': '2026-10-26 28.00',
      'R-108': '2026-11-03 46.00',
      'R-112': '2026-11-03 16.00',
      'R-110': '2026-11-05 44.00',
    },
    'the owed list',
  )
  const week = out('week.mjs', '2026-11-02')
  assert.match(
    week,
    /Tue 03 Nov\n(?: {2}.*\n)*? {2}19:00-22:00\s+Room A\s+The Riverbeds\s+£46\.00/,
    'the week sheet',
  )
  execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
