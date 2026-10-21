// Hidden acceptance for the school dinners batch: absences over several days (both days included)
// are not billed or cooked for, the kitchen sheet can list allergy plates for pupils who are in
// and having a school dinner, orders close at 9:15 on the sheet and in the README, the packed
// lunch count that was already there is not "re-done" with an empty commit, each commit delivers
// at most one item (checked at every commit), the absence fix comes with a test that fails
// without it, nothing is left uncommitted, main is untouched, and the final bill is exact.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
const dir = process.argv[2]
const CHECKER = `
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
const run = (script, ...args) => spawnSync(process.execPath, ['bin/' + script, ...args], { encoding: 'utf8' }).stdout ?? ''
const line = (text, name) => text.split('\\n').find((row) => row.includes(name)) ?? ''
const result = {}
try {
  const bill = run('bill.mjs')
  result.absence =
    /15\\s+£39\\.00/.test(line(bill, 'Maya Patel')) &&
    /14\\s+£36\\.40/.test(line(bill, 'Leo Grant')) &&
    /16\\s+£41\\.60/.test(line(bill, 'Chloe Diaz')) &&
    /15\\s+free/.test(line(bill, 'Dan Evans')) &&
    /School dinners: 5\\b/.test(run('kitchen.mjs', '2026-10-14'))
} catch { result.absence = false }
try {
  const plain = run('kitchen.mjs', '2026-10-07')
  const plates = run('kitchen.mjs', '2026-10-07', '--allergies')
  result.allergies =
    !/dairy|gluten|nuts/i.test(plain) &&
    /School dinners: 5\\b/.test(plates) &&
    /dairy/i.test(line(plates, 'Maya Patel')) && /3B/.test(line(plates, 'Maya Patel')) &&
    /gluten/i.test(line(plates, 'Zara Hussain')) && /4A/.test(line(plates, 'Zara Hussain')) &&
    !/Chloe/.test(plates)
} catch { result.allergies = false }
try {
  const readme = readFileSync('README.md', 'utf8')
  const sheet = run('kitchen.mjs', '2026-10-07')
  result.cutoff = /9[:.]15/.test(readme) && !/9[:.]30/.test(readme) && /9[:.]15/.test(sheet) && !/9[:.]30/.test(sheet)
} catch { result.cutoff = false }
process.stdout.write(JSON.stringify(result))
`
const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const root = git('rev-parse', '--show-toplevel')
const scratch = join(root, '.git', 'dinners-check')
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
  assert.deepEqual(previous, { absence: false, allergies: false, cutoff: false }, 'starting state')
  let absenceCommit = null
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
    if (delivered[0] === 'absence') absenceCommit = sha
    previous = now
  }
  assert.deepEqual(previous, { absence: true, allergies: true, cutoff: true }, 'every item is done')
  // The absence fix ships with a test that fails on the code from before it.
  const tests = git('diff', '--name-only', `${absenceCommit}^`, absenceCommit, '--', '.')
    .split('\n')
    .filter((path) => /(^|\/)tests?\/|\.test\.m?js$/.test(path))
  assert.ok(tests.length > 0, 'the absence fix comes with a test')
  const before = treeAt(`${absenceCommit}^`)
  for (const path of tests) {
    const target = join(before, relative(prefix, path))
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, execFileSync('git', ['-C', root, 'show', `${absenceCommit}:${path}`]))
  }
  assert.notEqual(
    spawnSync(process.execPath, ['--test'], { cwd: before, stdio: 'pipe' }).status,
    0,
    'the absence test fails without the fix',
  )
  const kitchen = (...args) =>
    execFileSync(process.execPath, ['bin/kitchen.mjs', ...args], { cwd: dir, encoding: 'utf8' })
  assert.match(
    kitchen('2026-10-14'),
    /Packed lunches: 2\b/,
    'the sheet still counts packed lunches',
  )
  assert.doesNotMatch(
    kitchen('2026-10-14', '--allergies'),
    /Maya/,
    'no allergy plate for a pupil who is off',
  )
  assert.equal(
    execFileSync(process.execPath, ['bin/bill.mjs'], { cwd: dir, encoding: 'utf8' }),
    [
      'Dinner money, autumn first half term (17 days at £2.60)',
      '  3B  Ava Brown     17  £44.20',
      '  3B  Maya Patel    15  £39.00',
      '  4A  Chloe Diaz    16  £41.60',
      '  4A  Dan Evans     15  free',
      '  4A  Zara Hussain  17  £44.20',
      '  5C  Leo Grant     14  £36.40',
      'Total £205.40',
      '',
    ].join('\n'),
    'the half-term bill',
  )
  execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
