// Hidden acceptance for the takings move to whole pence: every commit on the branch keeps the
// tests passing and `npm run report -- 2026-10` printing exactly what it printed before (so the
// code must read both forms before the files are converted, whatever order the steps were
// listed in); at the end every record in every takings file and the 2025 archive holds an integer
// `amountPence` equal to its old amount to the penny, with no `amount` left; a record still in
// pounds is no longer counted; `npm run add` writes pence; the September report, the 2025 year
// and both months' bank exports are unchanged; there are at least three commits; nothing is
// left uncommitted; and main is untouched.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
const dir = process.argv[2]
const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const root = git('rev-parse', '--show-toplevel')
const prefix = relative(root, dir)
const scratch = mkdtempSync(join(tmpdir(), 'clubhouse-'))
let n = 0
function treeAt(sha) {
  const work = join(scratch, `at-${n++}`)
  mkdirSync(work)
  execFileSync('sh', ['-c', `git -C "${root}" archive ${sha} "${prefix}" | tar -x -C "${work}"`])
  return join(work, prefix)
}
const run = (cwd, script, ...args) =>
  spawnSync(process.execPath, ['bin/' + script, ...args], { cwd, encoding: 'utf8' }).stdout ?? ''
const json = (path) => JSON.parse(readFileSync(path, 'utf8'))
const DATA = ['data/takings/2026-09.json', 'data/takings/2026-10.json', 'data/archive/2025.json']
try {
  const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$')
    .split('\n')
    .at(-1)
  assert.equal(git('rev-parse', 'main'), baseline, 'main is untouched')
  assert.equal(git('branch', '--show-current'), 'chore/pence', 'the work is on the branch')
  assert.equal(git('status', '--porcelain', '--', '.'), '', 'nothing left uncommitted')
  const base = treeAt(baseline)
  const expected = {
    report09: run(base, 'report.mjs', '2026-09'),
    report10: run(base, 'report.mjs', '2026-10'),
    year: run(base, 'year.mjs', '2025'),
    export09: run(base, 'export.mjs', '2026-09'),
    export10: run(base, 'export.mjs', '2026-10'),
  }
  assert.match(expected.report10, /Net\s+£87\.53/, 'baseline report')
  const commits = git('rev-list', '--reverse', `${baseline}..HEAD`).split('\n').filter(Boolean)
  assert.ok(commits.length >= 3, `the steps are separate commits (found ${commits.length})`)
  for (const sha of commits) {
    const tree = treeAt(sha)
    const tests = spawnSync(process.execPath, ['--test'], { cwd: tree, stdio: 'pipe' })
    assert.equal(tests.status, 0, `the tests pass at commit ${sha.slice(0, 8)}`)
    assert.equal(
      run(tree, 'report.mjs', '2026-10'),
      expected.report10,
      `the October report is unchanged at commit ${sha.slice(0, 8)}`,
    )
  }
  // Every record converted to the penny, nothing left in pounds.
  for (const path of DATA) {
    const before = json(join(base, path))
    const after = json(join(dir, path))
    assert.equal(after.length, before.length, `${path} keeps every record`)
    after.forEach((record, i) => {
      assert.ok(!('amount' in record), `${path} record ${i} still has amount`)
      assert.ok(Number.isInteger(record.amountPence), `${path} record ${i} has integer amountPence`)
      assert.equal(
        record.amountPence,
        Math.round(Number(before[i].amount) * 100),
        `${path} record ${i} converts to the penny`,
      )
    })
  }
  const others = readdirSync(join(dir, 'data/takings')).filter(
    (name) => !['2026-09.json', '2026-10.json'].includes(name),
  )
  assert.deepEqual(others, [], 'no extra takings files left behind')
  assert.equal(run(dir, 'report.mjs', '2026-09'), expected.report09, 'the September report')
  assert.equal(run(dir, 'report.mjs', '2026-10'), expected.report10, 'the October report')
  assert.equal(run(dir, 'year.mjs', '2025'), expected.year, 'the 2025 year from the archive')
  assert.equal(run(dir, 'export.mjs', '2026-09'), expected.export09, 'the September export')
  assert.equal(run(dir, 'export.mjs', '2026-10'), expected.export10, 'the October export')
  // In a copy: the old pounds handling is gone, and new slips go in as pence.
  const copy = join(scratch, 'copy')
  cpSync(dir, copy, { recursive: true, filter: (src) => !src.includes('node_modules') })
  writeFileSync(
    join(copy, 'data/takings/2026-12.json'),
    JSON.stringify([{ date: '2026-12-01', till: 'front', kind: 'sale', amount: 5 }]),
  )
  assert.doesNotMatch(
    run(copy, 'report.mjs', '2026-12'),
    /Net\s+£5\.00/,
    'a record in pounds is no longer read',
  )
  rmSync(join(copy, 'data/takings/2026-12.json'))
  const added = spawnSync(process.execPath, ['bin/add.mjs', '2026-10-30', 'front', '0.29'], {
    cwd: copy,
    encoding: 'utf8',
  })
  assert.equal(added.status, 0, 'add still works')
  spawnSync(process.execPath, ['bin/add.mjs', '2026-10-30', 'back', '19.99', 'refund'], {
    cwd: copy,
  })
  const tail = json(join(copy, 'data/takings/2026-10.json')).slice(-2)
  assert.deepEqual(
    tail.map((record) => [record.kind, record.amountPence, 'amount' in record]),
    [
      ['sale', 29, false],
      ['refund', -1999, false],
    ],
    'add writes whole pence',
  )
  assert.match(run(copy, 'report.mjs', '2026-10'), /Net\s+£67\.83/, 'added slips are counted')
  execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
