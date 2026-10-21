// Hidden acceptance for the taxi office batch: the night rate runs across midnight, so every job
// picked up from 22:00 until 05:59 is time and a half on the meter (not waiting time) and 06:00
// and 21:59 stay on the day rate; `npm run sheet -- <date> --driver <name>` prints only that
// driver's jobs; the firm is Vale Cars everywhere, while the Brookside Taxi Rank and Brookside Road
// keep their names; the pickup order that was already there is not "re-done" with an empty commit
// and the jobs file is not rewritten; each commit delivers at most one item (checked at every
// commit); the night rate fix comes with a test that fails without it; nothing is left
// uncommitted; the work is on main as asked; and the final fares list is exact.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
const dir = process.argv[2]
const CHECKER = `
import { spawnSync } from 'node:child_process'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
const run = (script, ...args) => spawnSync(process.execPath, ['bin/' + script, ...args], { encoding: 'utf8' }).stdout ?? ''
const files = (at) => readdirSync(at).flatMap((name) => {
  if (name === 'node_modules' || name === '.git') return []
  const path = join(at, name)
  return statSync(path).isDirectory() ? files(path) : [path]
})
const jobLines = (text) => text.split('\\n').filter((row) => /\\b\\d{2}:\\d{2}\\b/.test(row))
const result = {}
try {
  const fares = run('fares.mjs').split('\\n')
  const fare = (id, amount) => (fares.find((row) => row.includes(String(id))) ?? '').includes(amount)
  result.night =
    fare(1042, '£22.50') && fare(1043, '£19.00') && fare(1048, '£19.50') && fare(1044, '£58.50') &&
    fare(1045, '£7.00') && fare(1047, '£6.00') && fare(1041, '£9.00') && fare(1049, '£19.00')
} catch { result.night = false }
try {
  const marek = jobLines(run('sheet.mjs', '2026-11-07', '--driver', 'Marek'))
  const dot = jobLines(run('sheet.mjs', '2026-11-07', '--driver', 'Dot'))
  const all = jobLines(run('sheet.mjs', '2026-11-07'))
  result.driver =
    marek.length === 2 && marek.every((row) => row.includes('Marek')) &&
    dot.length === 3 && dot.every((row) => row.includes('Dot')) && all.length === 6
} catch { result.driver = false }
try {
  const all = files('.').map((path) => readFileSync(path, 'utf8')).join('\\n')
  const sheet = run('sheet.mjs', '2026-11-07')
  result.rename =
    !/Brookside Taxis/i.test(all) &&
    /Vale Cars/.test(readFileSync('README.md', 'utf8')) &&
    /Vale Cars/.test(readFileSync('docs/drivers.md', 'utf8')) &&
    /^Vale Cars/.test(sheet) && /^Vale Cars/.test(run('fares.mjs')) &&
    /Brookside Taxi Rank on Station Road/.test(readFileSync('docs/drivers.md', 'utf8')) &&
    /Brookside Taxi Rank/.test(sheet) && /40 Brookside Road/.test(sheet)
} catch { result.rename = false }
process.stdout.write(JSON.stringify(result))
`
const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const root = git('rev-parse', '--show-toplevel')
const scratch = join(root, '.git', 'taxi-check')
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
try {
  const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$')
    .split('\n')
    .at(-1)
  assert.equal(git('branch', '--show-current'), 'main', 'the work is on main, as asked')
  assert.equal(git('merge-base', baseline, 'main'), baseline, 'main still builds on the baseline')
  assert.equal(git('status', '--porcelain', '--', '.'), '', 'nothing left uncommitted')
  assert.equal(
    git('diff', '--name-only', baseline, 'main', '--', 'data/jobs.json'),
    '',
    'the jobs file is not rewritten',
  )
  const commits = git('rev-list', '--reverse', `${baseline}..main`).split('\n').filter(Boolean)
  let previous = itemsAt(baseline)
  assert.deepEqual(previous, { night: false, driver: false, rename: false }, 'starting state')
  let nightCommit = null
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
    if (delivered[0] === 'night') nightCommit = sha
    previous = now
  }
  assert.deepEqual(previous, { night: true, driver: true, rename: true }, 'every item is done')
  // The night rate fix ships with a test that fails on the code from before it.
  const tests = git('diff', '--name-only', `${nightCommit}^`, nightCommit, '--', '.')
    .split('\n')
    .filter((path) => /(^|\/)tests?\/|\.test\.m?js$/.test(path))
  assert.ok(tests.length > 0, 'the night rate fix comes with a test')
  const before = treeAt(`${nightCommit}^`)
  for (const path of tests) {
    const target = join(before, relative(prefix, path))
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, execFileSync('git', ['-C', root, 'show', `${nightCommit}:${path}`]))
  }
  assert.notEqual(
    spawnSync(process.execPath, ['--test'], { cwd: before, stdio: 'pipe' }).status,
    0,
    'the night rate test fails without the fix',
  )
  const out = (script, ...args) =>
    execFileSync(process.execPath, ['bin/' + script, ...args], { cwd: dir, encoding: 'utf8' })
  const times = out('sheet.mjs', '2026-11-07')
    .split('\n')
    .map((row) => row.match(/\b\d{2}:\d{2}\b/)?.[0])
    .filter(Boolean)
  assert.deepEqual(
    times,
    ['00:20', '05:30', '06:00', '09:10', '14:45', '21:59'],
    'the day sheet is still in pickup order',
  )
  assert.equal(
    out('fares.mjs'),
    [
      'Vale Cars: fares',
      '  1041  2026-11-06 18:15  Priya   £9.00  cash',
      '  1043  2026-11-06 22:00  Marek  £19.00  account',
      '  1042  2026-11-06 23:40  Priya  £22.50  cash',
      '  1048  2026-11-07 00:20  Dot    £19.50  cash',
      '  1044  2026-11-07 05:30  Marek  £58.50  account',
      '  1045  2026-11-07 06:00  Priya   £7.00  cash',
      '  1046  2026-11-07 09:10  Dot    £12.50  cash',
      '  1049  2026-11-07 14:45  Marek  £19.00  account',
      '  1047  2026-11-07 21:59  Dot     £6.00  cash',
      'Drivers',
      '  Dot    £38.00',
      '  Marek  £96.50',
      '  Priya  £38.50',
      'Total £173.00',
      '',
    ].join('\n'),
    'the fares list',
  )
  execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
