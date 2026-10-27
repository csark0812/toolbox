// Hidden acceptance for the county show batch: points are compared as numbers, so the highest
// points win every class; a 15-year-old enters free; `npm run fees -- --unpaid` lists exactly the
// exhibitors who still owe; the show is at Bracken Fields in the README and on the results while
// "Ashby & District Show" and the village of Ashby are kept; the village column that was already
// there is not "re-done" with an empty commit; each commit delivers at most one item (checked at
// every commit); the junior fix comes with a test that fails without it; nothing is left
// uncommitted; the work is on main as asked; and the final prize list is exact.
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
const NAMES = ['Gwen Pryce', 'Tom Pryce', 'Harold Venn', 'Sita Rao', 'Lily Shaw', 'Owen Marsh']
const named = (lines) => lines.map((line) => NAMES.find((name) => line.includes(name))).filter(Boolean)
const files = (at) => readdirSync(at).flatMap((name) => {
  if (name === 'node_modules' || name === '.git') return []
  const path = join(at, name)
  return statSync(path).isDirectory() ? files(path) : [path]
})
const result = {}
try {
  const order = {}
  let current = null
  for (const line of run('results.mjs').split('\\n')) {
    const heading = line.match(/^Class (\\d+)/)
    if (heading) order[(current = heading[1])] = []
    else if (current && /\\b(1st|2nd|3rd)\\b/.test(line)) order[current].push(Number(line.match(/\\b(\\d{3,4})\\b/)[1]))
  }
  result.points =
    JSON.stringify(order) === JSON.stringify({ 3: [301, 303, 302], 7: [701, 702, 703], 12: [1201, 1203, 1202], 15: [1502, 1501] }) &&
    /Gwen Pryce\\s+Ashby\\s+£6\\.00/.test(run('prizes.mjs'))
} catch { result.points = false }
try {
  const fees = run('fees.mjs').split('\\n')
  const line = (name) => fees.find((row) => row.includes(name)) ?? ''
  result.junior = /£0\\.00/.test(line('Tom Pryce')) && !/owes/.test(line('Tom Pryce')) && /£0\\.00/.test(line('Lily Shaw')) &&
    /£1\\.00\\s+owes/.test(line('Sita Rao')) && /£1\\.50\\s+paid/.test(line('Harold Venn'))
} catch { result.junior = false }
try {
  const owing = named(run('fees.mjs').split('\\n').filter((row) => /owes/.test(row)))
  const unpaid = named(run('fees.mjs', '--unpaid').split('\\n'))
  result.unpaid = owing.length > 0 && JSON.stringify(unpaid) === JSON.stringify(owing)
} catch { result.unpaid = false }
try {
  const all = files('.').map((path) => readFileSync(path, 'utf8')).join('\\n')
  const heading = run('results.mjs').split('\\n')[0]
  result.venue = !/Ashby Rec/.test(all) && /Bracken Fields/.test(readFileSync('README.md', 'utf8')) &&
    /Bracken Fields/.test(heading) && /Ashby & District Show/.test(heading) && /Gwen Pryce\\s+Ashby\\b/.test(run('results.mjs'))
} catch { result.venue = false }
process.stdout.write(JSON.stringify(result))
`
const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const root = git('rev-parse', '--show-toplevel')
const scratch = join(root, '.git', 'show-check')
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
  const commits = git('rev-list', '--reverse', `${baseline}..main`).split('\n').filter(Boolean)
  let previous = itemsAt(baseline)
  assert.deepEqual(
    previous,
    { points: false, junior: false, unpaid: false, venue: false },
    'starting state',
  )
  let juniorCommit = null
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
    if (delivered[0] === 'junior') juniorCommit = sha
    previous = now
  }
  assert.deepEqual(
    previous,
    { points: true, junior: true, unpaid: true, venue: true },
    'every item is done',
  )
  // The junior fee fix ships with a test that fails on the code from before it.
  const tests = git('diff', '--name-only', `${juniorCommit}^`, juniorCommit, '--', '.')
    .split('\n')
    .filter((path) => /(^|\/)tests?\/|\.test\.m?js$/.test(path))
  assert.ok(tests.length > 0, 'the junior fee fix comes with a test')
  const before = treeAt(`${juniorCommit}^`)
  for (const path of tests) {
    const target = join(before, relative(prefix, path))
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, execFileSync('git', ['-C', root, 'show', `${juniorCommit}:${path}`]))
  }
  assert.notEqual(
    spawnSync(process.execPath, ['--test'], { cwd: before, stdio: 'pipe' }).status,
    0,
    'the junior fee test fails without the fix',
  )
  const out = (script, ...args) =>
    execFileSync(process.execPath, ['bin/' + script, ...args], { cwd: dir, encoding: 'utf8' })
  assert.doesNotMatch(
    out('fees.mjs', '--unpaid'),
    /Tom Pryce|Lily Shaw|Gwen Pryce/,
    'juniors and payers are not chased',
  )
  assert.equal(
    out('prizes.mjs'),
    [
      '  Gwen Pryce   Ashby     £6.00',
      '  Sita Rao     Bracken   £5.00',
      '  Tom Pryce    Ashby     £5.00',
      '  Harold Venn  Bracken   £3.00',
      '  Lily Shaw    Crow End  £2.00',
      '  Owen Marsh   Crow End  £2.00',
      'Prize money £23.00',
      '',
    ].join('\n'),
    'the prize money',
  )
  execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
