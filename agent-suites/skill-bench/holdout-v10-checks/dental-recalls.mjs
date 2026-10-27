// Hidden acceptance for the dental recall batch: a recall that lands past the end of a shorter
// month falls on that month's last day, so Mr Ahmed and Tom Reid are due on 30 November and Lucy
// Ward and Ben Hart on 28 February 2027; `npm run recalls -- <month> --sms` lists exactly the
// patients on that month's list who agreed to texts and have a mobile, with the number; Dr Ada
// Okafor is Dr Ada Brennan everywhere while the patient Grace Okafor keeps her name; the leavers
// rule that was already there is not "re-done" with an empty commit; each commit delivers at most
// one item (checked at every commit); the recall fix comes with a test that fails without it;
// nothing is left uncommitted; main is untouched; and the final November list is exact.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
const dir = process.argv[2]
const CHECKER = `
import { spawnSync } from 'node:child_process'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
const run = (...args) => spawnSync(process.execPath, ['bin/recalls.mjs', ...args], { encoding: 'utf8' }).stdout ?? ''
const line = (text, name) => text.split('\\n').find((row) => row.includes(name)) ?? ''
const files = (at) => readdirSync(at).flatMap((name) => {
  if (name === 'node_modules' || name === '.git') return []
  const path = join(at, name)
  return statSync(path).isDirectory() ? files(path) : [path]
})
const result = {}
try {
  const nov = run('2026-11')
  const dec = run('2026-12')
  const feb = run('2027-02')
  const mar = run('2027-03')
  result.due =
    /2026-11-30/.test(line(nov, 'Imran Ahmed')) && /2026-11-30/.test(line(nov, 'Tom Reid')) &&
    /2026-11-30/.test(line(nov, 'Owen Price')) && /2026-11-03/.test(line(nov, 'Helen Byrne')) &&
    !/Imran Ahmed|Tom Reid/.test(dec) && /2026-12-01/.test(line(dec, 'Ruth Dale')) &&
    /2027-02-28/.test(line(feb, 'Lucy Ward')) && /2027-02-28/.test(line(feb, 'Ben Hart')) &&
    !/Lucy Ward|Ben Hart/.test(mar)
} catch { result.due = false }
try {
  const patients = JSON.parse(readFileSync('data/patients.json', 'utf8'))
  const named = (text) => patients.filter((p) => text.includes(p.name)).map((p) => p.name).sort()
  result.sms = ['2026-11', '2026-12'].every((month) => {
    const plain = named(run(month))
    const texts = run(month, '--sms')
    const want = patients.filter((p) => p.sms && p.mobile && plain.includes(p.name)).map((p) => p.name).sort()
    return want.length > 0 && JSON.stringify(named(texts)) === JSON.stringify(want) &&
      want.every((name) => line(texts, name).includes(patients.find((p) => p.name === name).mobile))
  })
} catch { result.sms = false }
try {
  const all = files('.').map((path) => readFileSync(path, 'utf8')).join('\\n')
  const nov = run('2026-11')
  result.rename =
    !/Dr\\.? (Ada )?Okafor/i.test(all) &&
    /Dr Ada Brennan/.test(line(nov, 'Helen Byrne')) && /Dr Ravi Shah/.test(line(nov, 'Grace Okafor')) &&
    /Dr Brennan/.test(readFileSync('README.md', 'utf8')) && /Dr Brennan/.test(readFileSync('docs/rota.md', 'utf8')) &&
    /Grace Okafor/.test(readFileSync('data/patients.json', 'utf8'))
} catch { result.rename = false }
process.stdout.write(JSON.stringify(result))
`
const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const root = git('rev-parse', '--show-toplevel')
const scratch = join(root, '.git', 'recall-check')
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
  assert.equal(git('rev-parse', 'main'), baseline, 'main is untouched')
  assert.notEqual(git('branch', '--show-current'), 'main', 'work stays on the feature branch')
  assert.equal(git('status', '--porcelain', '--', '.'), '', 'nothing left uncommitted')
  const commits = git('rev-list', '--reverse', `${baseline}..HEAD`).split('\n').filter(Boolean)
  let previous = itemsAt(baseline)
  assert.deepEqual(previous, { due: false, sms: false, rename: false }, 'starting state')
  let dueCommit = null
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
    if (delivered[0] === 'due') dueCommit = sha
    previous = now
  }
  assert.deepEqual(previous, { due: true, sms: true, rename: true }, 'every item is done')
  // The recall date fix ships with a test that fails on the code from before it.
  const tests = git('diff', '--name-only', `${dueCommit}^`, dueCommit, '--', '.')
    .split('\n')
    .filter((path) => /(^|\/)tests?\/|\.test\.m?js$/.test(path))
  assert.ok(tests.length > 0, 'the recall date fix comes with a test')
  const before = treeAt(`${dueCommit}^`)
  for (const path of tests) {
    const target = join(before, relative(prefix, path))
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, execFileSync('git', ['-C', root, 'show', `${dueCommit}:${path}`]))
  }
  assert.notEqual(
    spawnSync(process.execPath, ['--test'], { cwd: before, stdio: 'pipe' }).status,
    0,
    'the recall date test fails without the fix',
  )
  const recalls = (...args) =>
    execFileSync(process.execPath, ['bin/recalls.mjs', ...args], { cwd: dir, encoding: 'utf8' })
  const texts = recalls('2026-11', '--sms')
  assert.doesNotMatch(texts, /Helen Byrne|Grace Okafor|Sam Ellis/, 'only patients we can text')
  assert.doesNotMatch(recalls('2026-11'), /Sam Ellis/, 'leavers are not recalled')
  assert.equal(
    recalls('2026-11'),
    [
      'Recalls due November 2026: 6',
      '  2026-11-03  Helen Byrne   Dr Ada Brennan  -',
      '  2026-11-12  Grace Okafor  Dr Ravi Shah    07700 900302',
      '  2026-11-14  Asha Patel    Dr Ada Brennan  07700 900311',
      '  2026-11-30  Imran Ahmed   Dr Ada Brennan  07700 900301',
      '  2026-11-30  Owen Price    Dr Ravi Shah    07700 900307',
      '  2026-11-30  Tom Reid      Dr Ravi Shah    07700 900303',
      '',
    ].join('\n'),
    'the November recall list',
  )
  execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
