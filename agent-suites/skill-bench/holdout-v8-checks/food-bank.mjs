// Hidden acceptance for the food bank batch: households of five get a large parcel, cancelled
// referrals are left out however the status is typed, collection runs to 13:00 in the lists and
// README, each commit delivers at most one item (checked at every commit), nothing is left
// uncommitted, and main is untouched.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
const dir = process.argv[2]
const CHECKER = `
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
const run = (script, ...args) => spawnSync(process.execPath, ['bin/' + script, ...args], { encoding: 'utf8' }).stdout ?? ''
const lineFor = (text, ref) => text.split('\\n').find((line) => line.includes(ref)) ?? ''
const result = {}
const tue = run('packing.mjs', 'Tue')
const thu = run('packing.mjs', 'Thu')
const sat = run('packing.mjs', 'Sat')
try {
  result.large = /large\\s*$/.test(lineFor(tue, 'K-201')) && /large\\s*$/.test(lineFor(thu, 'K-207')) && /large\\s*$/.test(lineFor(tue, 'K-204')) && /medium\\s*$/.test(lineFor(sat, 'K-209')) && /small\\s*$/.test(lineFor(tue, 'K-202'))
} catch { result.large = false }
try {
  const report = run('report.mjs')
  result.cancelled = !tue.includes('K-203') && !thu.includes('K-208') && !thu.includes('K-206') && tue.includes('K-201') && thu.includes('K-207') && /This week: 6 parcels/.test(report)
} catch { result.cancelled = false }
try {
  const readme = readFileSync('README.md', 'utf8')
  result.hours = /10:00-13:00/.test(tue.split('\\n')[0]) && /13:00/.test(readme) && !/12:00/.test(readme)
} catch { result.hours = false }
process.stdout.write(JSON.stringify(result))
`
const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const root = git('rev-parse', '--show-toplevel')
const scratch = join(root, '.git', 'food-check')
rmSync(scratch, { recursive: true, force: true })
mkdirSync(scratch, { recursive: true })
writeFileSync(join(scratch, 'items.mjs'), CHECKER)
const prefix = relative(root, dir)
let n = 0
function itemsAt(sha) {
  const work = join(scratch, `at-${n++}`)
  mkdirSync(work)
  execFileSync('sh', ['-c', `git -C "${root}" archive ${sha} "${prefix}" | tar -x -C "${work}"`])
  return JSON.parse(
    execFileSync(process.execPath, [join(scratch, 'items.mjs')], {
      cwd: join(work, prefix),
      encoding: 'utf8',
    }),
  )
}
try {
  const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$')
    .split('\n')
    .at(-1)
  assert.equal(git('rev-parse', 'main'), baseline, 'main is untouched')
  assert.notEqual(git('branch', '--show-current'), 'main', 'work stays on the feature branch')
  assert.equal(git('status', '--porcelain', '--', '.'), '', 'nothing left uncommitted')
  const commits = git('rev-list', '--reverse', `${baseline}..HEAD`).split('\n').filter(Boolean)
  let previous = itemsAt(baseline)
  assert.deepEqual(previous, { large: false, cancelled: false, hours: false }, 'starting state')
  for (const sha of commits) {
    const now = itemsAt(sha)
    const delivered = Object.keys(now).filter((item) => now[item] && !previous[item])
    assert.ok(
      delivered.length <= 1,
      `commit ${sha.slice(0, 8)} delivers more than one item: ${delivered.join(', ')}`,
    )
    previous = now
  }
  assert.deepEqual(previous, { large: true, cancelled: true, hours: true }, 'every item is done')
  const report = execFileSync(process.execPath, ['bin/report.mjs'], { cwd: dir, encoding: 'utf8' })
  assert.match(report, /small\s+2\b/)
  assert.match(report, /medium\s+1\b/)
  assert.match(report, /large\s+3\b/)
  execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
