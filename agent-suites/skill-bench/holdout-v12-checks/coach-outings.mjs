// Hidden acceptance for the coach outings date migration: at every commit on the branch the tests
// pass and the October and November manifests, the 2025 and 2026 year reports and the Brimble's
// export print exactly what they printed before (so the code learns ISO before the files change,
// or both move in one commit); at the end every date in trips.json, bookings.json and the 2025
// archive is an ISO date, the date functions no longer read day-first dates (whatever the parser is
// called), `npm run book` writes ISO dates, the steps are in separate commits (two or more, since
// combining steps to keep every commit working is allowed), nothing is left uncommitted and main is
// untouched.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync } from 'node:fs'
import { join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const root = git('rev-parse', '--show-toplevel')
const scratch = join(root, '.git', 'coach-check')
rmSync(scratch, { recursive: true, force: true })
mkdirSync(scratch, { recursive: true })
const prefix = relative(root, dir)
let n = 0
function treeAt(sha) {
  const work = join(scratch, `at-${n++}`)
  mkdirSync(work)
  execFileSync('sh', ['-c', `git -C "${root}" archive ${sha} "${prefix}" | tar -x -C "${work}"`])
  return join(work, prefix)
}
const RUNS = [
  ['manifest.mjs', '2026-10'],
  ['manifest.mjs', '2026-11'],
  ['year.mjs', '2025'],
  ['year.mjs', '2026'],
  ['export.mjs'],
]
const outputs = (at) =>
  RUNS.map(([script, ...args]) => {
    const r = spawnSync(process.execPath, ['bin/' + script, ...args], { cwd: at, encoding: 'utf8' })
    return `${script} ${args.join(' ')}\n${r.status}\n${r.stdout}`
  })
const ISO = /^\d{4}-\d{2}-\d{2}$/
try {
  const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$')
    .split('\n')
    .at(-1)
  assert.equal(git('rev-parse', 'main'), baseline, 'main is untouched')
  assert.equal(git('branch', '--show-current'), 'chore/iso-dates', 'the work is on the branch')
  assert.equal(git('status', '--porcelain', '--', '.'), '', 'nothing left uncommitted')
  const commits = git('rev-list', '--reverse', `${baseline}..HEAD`).split('\n').filter(Boolean)
  assert.ok(commits.length >= 2, `separate commits for the steps (found ${commits.length})`)
  const expected = outputs(treeAt(baseline))
  for (const sha of commits) {
    const at = treeAt(sha)
    const now = outputs(at)
    for (let i = 0; i < RUNS.length; i++)
      assert.equal(now[i], expected[i], `commit ${sha.slice(0, 8)} changes ${RUNS[i].join(' ')}`)
    assert.equal(
      spawnSync(process.execPath, ['--test'], { cwd: at, stdio: 'pipe' }).status,
      0,
      `npm test fails at commit ${sha.slice(0, 8)}`,
    )
  }
  const json = (path) => JSON.parse(readFileSync(join(dir, 'data', path), 'utf8'))
  const trips = json('trips.json')
  const bookings = json('bookings.json')
  const archive = json('archive/2025.json')
  assert.equal(trips.length, 5, 'every trip kept')
  assert.equal(bookings.length, 12, 'every booking kept')
  assert.equal(archive.trips.length + archive.bookings.length, 10, 'the archive kept whole')
  for (const trip of [...trips, ...archive.trips]) assert.match(trip.date, ISO, `${trip.code} date`)
  for (const booking of [...bookings, ...archive.bookings])
    assert.match(booking.bookedOn, ISO, `${booking.ref} bookedOn`)
  assert.equal(trips.find((t) => t.code === 'T-261107').date, '2026-11-07', 'Duxford is 7 November')
  assert.equal(archive.trips.find((t) => t.code === 'T-250614').date, '2025-06-14', 'Weymouth')
  // The day-first reading is gone: none of the date helpers that are still there reads day-first
  // text the old way any more (they may throw, or read it some other way).
  const dates = await import(pathToFileURL(join(dir, 'src/dates.mjs')).href)
  const DAY_FIRST = {
    parseUkDate: [
      { year: 2026, month: 11, day: 21 },
      { year: 2026, month: 11, day: 7 },
    ],
    sortKey: ['2026-11-21', '2026-11-07'],
    dayLabel: ['Sat 21 Nov 2026', 'Sat 07 Nov 2026'],
    shortLabel: ['21 Nov', '7 Nov'],
  }
  for (const [name, old] of Object.entries(DAY_FIRST)) {
    if (typeof dates[name] !== 'function') continue
    ;['21.11.2026', '7/11/2026'].forEach((text, i) => {
      let got
      try {
        got = dates[name](text)
      } catch {
        return
      }
      assert.notDeepEqual(got, old[i], `${name}(${JSON.stringify(text)}) still reads day first`)
    })
  }
  // A new booking is written with an ISO date.
  const copy = treeAt('HEAD')
  const before = new Date()
  execFileSync(process.execPath, ['bin/book.mjs', 'T-261128', 'Ann Lee', '2'], {
    cwd: copy,
    stdio: 'pipe',
  })
  const added = JSON.parse(readFileSync(join(copy, 'data/bookings.json'), 'utf8')).at(-1)
  const pad = (v) => String(v).padStart(2, '0')
  const local = `${before.getFullYear()}-${pad(before.getMonth() + 1)}-${pad(before.getDate())}`
  assert.equal(added.name, 'Ann Lee', 'the booking is added')
  assert.ok(
    [local, before.toISOString().slice(0, 10)].includes(added.bookedOn),
    `a new booking's date is ISO (got ${added.bookedOn})`,
  )
  execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
