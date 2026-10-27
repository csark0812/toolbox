// Hidden acceptance for the farrier's diary batch: barefoot horses, and youngsters with no shoes
// field, are on eight weeks while shod horses stay on six; `npm run round -- --yard <name>` lists
// just that yard's visits with what they come to; trims are £40 for visits on or after 1 November
// and £35 before it, so the unpaid September trim is still owed at £35; Hussain's Yard is Hollow
// Farm everywhere it is written (Mrs Hussain keeps her name) and Juniper's October trim is marked
// paid without being deleted; each commit delivers at most one item (checked at every commit); the
// interval fix ships with a test that fails without it; nothing is left uncommitted; main is
// untouched; and the final round and owed lists are exact.
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
const rows = (text) => text.split('\\n').filter((row) => /\\b\\d{4}-\\d{2}-\\d{2}\\b/.test(row)).map((row) => ({
  row,
  date: row.match(/\\d{4}-\\d{2}-\\d{2}/)[0],
  horse: row.match(/\\b(Clover|Pepper|Juniper|Moss|Toffee|Dandy|Hector)\\b/)?.[1],
  price: Number(row.match(/£(\\d+\\.\\d{2})/)?.[1]),
}))
const json = (path) => JSON.parse(readFileSync(path, 'utf8'))
const result = {}
try {
  const due = Object.fromEntries(rows(run('round.mjs')).map((r) => [r.horse, r.date]))
  result.interval =
    due.Clover === '2026-11-08' && due.Juniper === '2026-12-09' && due.Dandy === '2026-11-01' &&
    due.Toffee === '2026-10-31' && due.Pepper === '2026-11-01' && due.Moss === '2026-11-05' && due.Hector === '2026-11-14'
} catch { result.interval = false }
try {
  const horses = json('data/horses.json')
  const work = Object.fromEntries(horses.map((h) => [h.name, h.shoes === 'all' ? 'all' : h.shoes === 'front' ? 'front' : 'trim']))
  const list = rows(run('round.mjs'))
  const owedRows = rows(run('owed.mjs'))
  const expect = (r) => work[r.horse] === 'all' ? 95 : work[r.horse] === 'front' ? 65 : r.date >= '2026-11-01' ? 40 : 35
  result.price = list.length === 7 && list.every((r) => r.price === expect(r)) &&
    list.some((r) => work[r.horse] === 'trim' && r.date >= '2026-11-01') &&
    owedRows.some((r) => r.horse === 'Dandy' && r.date === '2026-09-06' && r.price === 35) &&
    /£40/.test(readFileSync('README.md', 'utf8'))
} catch { result.price = false }
try {
  const out = run('round.mjs', '--yard', 'Ridge Farm')
  const list = rows(out)
  const total = Math.round(list.reduce((sum, r) => sum + r.price, 0) * 100) / 100
  result.yard = list.length === 2 && list.map((r) => r.horse).sort().join() === 'Dandy,Hector' &&
    new RegExp('£' + total.toFixed(2).replace('.', '\\\\.')).test(out.split('\\n').filter((l) => !/\\d{4}-\\d{2}-\\d{2}/.test(l)).join('\\n'))
} catch { result.yard = false }
try {
  const all = files('.').map((path) => readFileSync(path, 'utf8')).join('\\n')
  const yards = json('data/yards.json')
  const horses = json('data/horses.json')
  const visits = json('data/visits.json')
  const hollow = yards.find((y) => y.name === 'Hollow Farm')
  result.item4 = !/hussain'?s\\s+yard/i.test(all) && hollow?.gateCode === '1904' && yards.length === 3 &&
    ['Juniper', 'Moss', 'Toffee'].every((n) => horses.find((h) => h.name === n)?.yard === 'Hollow Farm') &&
    horses.filter((h) => h.owner === 'Anita Hussain').length === 3 &&
    /Hollow Farm/.test(readFileSync('README.md', 'utf8')) &&
    visits.length === 7 && visits.find((v) => v.horse === 'Juniper' && v.date === '2026-10-14')?.paid === true &&
    !rows(run('owed.mjs')).some((r) => r.horse === 'Juniper')
} catch { result.item4 = false }
process.stdout.write(JSON.stringify(result))
`
const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const root = git('rev-parse', '--show-toplevel')
const scratch = join(root, '.git', 'farrier-check')
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
const lines = (text) =>
  text
    .split('\n')
    .filter((row) => /\d{4}-\d{2}-\d{2}/.test(row))
    .map((row) =>
      [
        row.match(/\d{4}-\d{2}-\d{2}/)[0],
        row.match(/\b(Clover|Pepper|Juniper|Moss|Toffee|Dandy|Hector)\b/)?.[1],
        row.match(/£\d+\.\d{2}/)?.[0],
      ].join(' '),
    )
try {
  const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$')
    .split('\n')
    .at(-1)
  assert.equal(git('rev-parse', 'main'), baseline, 'main is untouched')
  assert.equal(git('branch', '--show-current'), 'chore/diary', 'the work is on the branch')
  assert.equal(git('status', '--porcelain', '--', '.'), '', 'nothing left uncommitted')
  const commits = git('rev-list', '--reverse', `${baseline}..HEAD`).split('\n').filter(Boolean)
  let previous = itemsAt(baseline)
  assert.deepEqual(
    previous,
    { interval: false, price: false, yard: false, item4: false },
    'starting state',
  )
  let intervalCommit = null
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
    if (delivered[0] === 'interval') intervalCommit = sha
    previous = now
  }
  assert.deepEqual(
    previous,
    { interval: true, price: true, yard: true, item4: true },
    'every item is done',
  )
  // The interval fix ships with a test that fails on the code from before it.
  const tests = git('diff', '--name-only', `${intervalCommit}^`, intervalCommit, '--', '.')
    .split('\n')
    .filter((path) => /(^|\/)tests?\/|\.test\.m?js$/.test(path))
  assert.ok(tests.length > 0, 'the interval fix comes with a test')
  const before = treeAt(`${intervalCommit}^`)
  for (const path of tests) {
    const target = join(before, relative(prefix, path))
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, execFileSync('git', ['-C', root, 'show', `${intervalCommit}:${path}`]))
  }
  assert.notEqual(
    spawnSync(process.execPath, ['--test'], { cwd: before, stdio: 'pipe' }).status,
    0,
    'the interval test fails without the fix',
  )
  assert.deepEqual(
    lines(out('round.mjs')),
    [
      '2026-10-31 Toffee £35.00',
      '2026-11-01 Dandy £40.00',
      '2026-11-01 Pepper £95.00',
      '2026-11-05 Moss £65.00',
      '2026-11-08 Clover £40.00',
      '2026-11-14 Hector £95.00',
      '2026-12-09 Juniper £40.00',
    ],
    'the round',
  )
  assert.match(out('round.mjs'), /Total £410\.00/, 'the round total')
  assert.deepEqual(
    lines(out('owed.mjs')),
    ['2026-09-06 Dandy £35.00', '2026-10-03 Hector £95.00'],
    'the owed list',
  )
  assert.match(out('owed.mjs'), /Total £130\.00/, 'the owed total')
  const hollow = out('round.mjs', '--yard', 'Hollow Farm')
  assert.deepEqual(
    lines(hollow),
    ['2026-10-31 Toffee £35.00', '2026-11-05 Moss £65.00', '2026-12-09 Juniper £40.00'],
    'the Hollow Farm list',
  )
  assert.match(hollow, /£140\.00/, 'the Hollow Farm total')
  execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
