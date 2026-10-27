// Hidden acceptance for the window cleaning batch: a customer due on the Monday is on that week's
// round, cash payments entered on the phone come off what's owed, `--by-street` prints the round
// street by street in house-number order (Flat 3, 22 Mill Lane is number 22), the new phone number
// replaces the old one everywhere, the price column that was already there is not "re-done" with
// an empty commit, each commit delivers at most one item (checked at every commit), the cash fix
// comes with a test that fails without it, nothing is left uncommitted, main is untouched, and
// the final list of who owes what is exact.
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
const ORDER = ['3 Elm Road', '10 Elm Road', '14 Elm Road', '2 Mill Lane', '12 Mill Lane', 'Flat 3, 22 Mill Lane', '1 Station Road', '5 Station Road', '9 Station Road', '21 Station Road']
const addresses = (text) =>
  text.split('\\n').map((line) =>
    ORDER.filter((address) => new RegExp('(^|[^\\\\d])' + address).test(line)).sort((a, b) => b.length - a.length)[0],
  ).filter(Boolean)
const files = (at) => readdirSync(at).flatMap((name) => {
  if (name === 'node_modules' || name === '.git') return []
  const path = join(at, name)
  return statSync(path).isDirectory() ? files(path) : [path]
})
const result = {}
try {
  const week = addresses(run('round.mjs', '2026-11-02'))
  const next = addresses(run('round.mjs', '2026-11-09'))
  result.monday = week.length === 8 && week.includes('14 Elm Road') && week.includes('10 Elm Road') && week.includes('12 Mill Lane') &&
    next.length === 2 && next.includes('2 Mill Lane') && next.includes('9 Station Road')
} catch { result.monday = false }
try {
  const owed = run('owed.mjs')
  result.cash = !/Ms Osei|Mr Lowe/.test(owed) && /Total owed £53\\.00/.test(owed)
} catch { result.cash = false }
try {
  result.street = ['2026-11-02', '2026-11-09'].every((monday) => {
    const plain = addresses(run('round.mjs', monday))
    const sorted = addresses(run('round.mjs', monday, '--by-street'))
    return (monday === '2026-11-09' || plain.length > 0) && JSON.stringify(sorted) === JSON.stringify(ORDER.filter((address) => plain.includes(address)))
  })
} catch { result.street = false }
try {
  const all = files('.').map((path) => readFileSync(path, 'utf8')).join('\\n')
  result.phone = !/900118/.test(all) && /07700 900461/.test(readFileSync('README.md', 'utf8')) &&
    /07700 900461/.test(readFileSync('docs/leaflet.md', 'utf8')) && /07700 900461/.test(run('owed.mjs'))
} catch { result.phone = false }
process.stdout.write(JSON.stringify(result))
`
const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const root = git('rev-parse', '--show-toplevel')
const scratch = join(root, '.git', 'windows-check')
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
  const none = { monday: false, cash: false, street: false, phone: false }
  let previous = itemsAt(baseline)
  assert.deepEqual(previous, none, 'starting state')
  let cashCommit = null
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
    if (delivered[0] === 'cash') cashCommit = sha
    previous = now
  }
  assert.deepEqual(
    previous,
    { monday: true, cash: true, street: true, phone: true },
    'every item is done',
  )
  // The cash fix ships with a test that fails on the code from before it.
  const tests = git('diff', '--name-only', `${cashCommit}^`, cashCommit, '--', '.')
    .split('\n')
    .filter((path) => /(^|\/)tests?\/|\.test\.m?js$/.test(path))
  assert.ok(tests.length > 0, 'the cash fix comes with a test')
  const before = treeAt(`${cashCommit}^`)
  for (const path of tests) {
    const target = join(before, relative(prefix, path))
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, execFileSync('git', ['-C', root, 'show', `${cashCommit}:${path}`]))
  }
  assert.notEqual(
    spawnSync(process.execPath, ['--test'], { cwd: before, stdio: 'pipe' }).status,
    0,
    'the cash test fails without the fix',
  )
  assert.match(
    execFileSync(process.execPath, ['bin/round.mjs', '2026-11-02'], { cwd: dir, encoding: 'utf8' }),
    /14 Elm Road\s+Mr Dawson\s+£12\.00/,
    'the round still shows what to collect',
  )
  assert.equal(
    execFileSync(process.execPath, ['bin/owed.mjs'], { cwd: dir, encoding: 'utf8' }),
    [
      '  C01  14 Elm Road           Mr Dawson  £12.00',
      '  C04  10 Elm Road           Mrs Kaur   £14.00',
      '  C08  12 Mill Lane          Ms Reed    £11.00',
      '  C09  5 Station Road        Mr Ahmed   £16.00',
      'Total owed £53.00',
      'Reminder slips: ring us on 07700 900461 with any questions.',
      '',
    ].join('\n'),
    'who still owes what',
  )
  execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
