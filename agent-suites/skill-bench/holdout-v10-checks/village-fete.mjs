// Hidden acceptance for the village fete batch: a charity's half price no longer leaks into the
// pitches booked after it, so every non-charity pays full price and later charities pay half;
// `npm run pitches -- --electric` lists exactly the stalls still coming that need a hook-up, with
// the total amps; the fete is on Saturday 19 June 2027 in the code, the README and the poster, with
// no trace of 12 June left; Edna Hale's cancelled stall is off the list; the phone numbers that
// were already there are not "re-done" with an empty commit; each commit delivers at most one
// item (checked at every commit); the pitch fee fix comes with a test that fails without it;
// nothing is left uncommitted; main is untouched; and the final pitch list is exact.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
const dir = process.argv[2]
const CHECKER = `
import { spawnSync } from 'node:child_process'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
const run = (...args) => spawnSync(process.execPath, ['bin/pitches.mjs', ...args], { encoding: 'utf8' }).stdout ?? ''
const line = (text, name) => text.split('\\n').find((row) => row.includes(name)) ?? ''
const files = (at) => readdirSync(at).flatMap((name) => {
  if (name === 'node_modules' || name === '.git') return []
  const path = join(at, name)
  return statSync(path).isDirectory() ? files(path) : [path]
})
const result = {}
try {
  const out = run()
  const fee = (name, amount) => line(out, name).trimEnd().endsWith(amount)
  result.fees =
    fee('Ashcombe Rotary Club', '£30.00') && fee("Hogg's Ices", '£30.00') && fee("Webb's Butchers", '£30.00') &&
    fee('1st Ashcombe Scouts', '£15.00') && fee('Rosa Ferns', '£15.00') && fee("St Mary's Church", '£15.00') &&
    fee('Ashcombe Brownies', '£7.50')
} catch { result.fees = false }
try {
  const stalls = JSON.parse(readFileSync('data/stalls.json', 'utf8'))
  const out = run('--electric')
  const named = stalls.filter((stall) => out.includes(stall.holder)).map((stall) => stall.holder).sort()
  const powered = stalls.filter((stall) => !stall.cancelled && stall.amps > 0)
  const amps = powered.reduce((sum, stall) => sum + stall.amps, 0)
  result.electric =
    powered.length > 0 &&
    JSON.stringify(named) === JSON.stringify(powered.map((stall) => stall.holder).sort()) &&
    new RegExp('(?<!\\\\d)' + amps + '(?!\\\\d)').test(out.replace(/\\b\\d{5} \\d{6}\\b/g, ''))
} catch { result.electric = false }
try {
  const all = files('.').map((path) => readFileSync(path, 'utf8')).join('\\n')
  result.date =
    !/\\b12(th)? June\\b|2027-06-12|Saturday 12\\b/i.test(all) &&
    /^Ashcombe Village Fete, Saturday 19 June 2027$/m.test(run()) &&
    /19(th)? June 2027/.test(readFileSync('README.md', 'utf8')) &&
    /19(th)? June 2027/.test(readFileSync('docs/poster.md', 'utf8'))
} catch { result.date = false }
try {
  const out = run()
  result.cancel = /Pitch money/.test(out) && !/Edna Hale|Jam and chutney/.test(out)
} catch { result.cancel = false }
process.stdout.write(JSON.stringify(result))
`
const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const root = git('rev-parse', '--show-toplevel')
const scratch = join(root, '.git', 'fete-check')
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
  assert.deepEqual(
    previous,
    { fees: false, electric: false, date: false, cancel: false },
    'starting state',
  )
  let feesCommit = null
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
    if (delivered[0] === 'fees') feesCommit = sha
    previous = now
  }
  assert.deepEqual(
    previous,
    { fees: true, electric: true, date: true, cancel: true },
    'every item is done',
  )
  // The pitch fee fix ships with a test that fails on the code from before it.
  const tests = git('diff', '--name-only', `${feesCommit}^`, feesCommit, '--', '.')
    .split('\n')
    .filter((path) => /(^|\/)tests?\/|\.test\.m?js$/.test(path))
  assert.ok(tests.length > 0, 'the pitch fee fix comes with a test')
  const before = treeAt(`${feesCommit}^`)
  for (const path of tests) {
    const target = join(before, relative(prefix, path))
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, execFileSync('git', ['-C', root, 'show', `${feesCommit}:${path}`]))
  }
  assert.notEqual(
    spawnSync(process.execPath, ['--test'], { cwd: before, stdio: 'pipe' }).status,
    0,
    'the pitch fee test fails without the fix',
  )
  const pitches = (...args) =>
    execFileSync(process.execPath, ['bin/pitches.mjs', ...args], { cwd: dir, encoding: 'utf8' })
  const electric = pitches('--electric')
  assert.doesNotMatch(electric, /Lily Moss/, 'no hook-up for a cancelled stall')
  assert.match(electric, /(?<!\d)55(?!\d)/, 'the stalls still coming need 55 amps')
  assert.equal(
    pitches(),
    [
      'Ashcombe Village Fete, Saturday 19 June 2027',
      "  Plants           St Mary's Church          01632 960112  large  £15.00",
      '  Cakes            Ashcombe Brownies         01632 960187  small  £7.50',
      '  Barbecue         Ashcombe Rotary Club      07700 900214  large  £30.00',
      "  Ice creams       Hogg's Ices               07700 900377  large  £30.00",
      '  Tombola          1st Ashcombe Scouts       01632 960145  large  £15.00',
      "  Hog roast        Webb's Butchers           01632 960171  large  £30.00",
      '  Crafts           Rosa Ferns                07700 900529  small  £15.00',
      'Pitch money £142.50',
      '',
    ].join('\n'),
    'the pitch list',
  )
  execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
