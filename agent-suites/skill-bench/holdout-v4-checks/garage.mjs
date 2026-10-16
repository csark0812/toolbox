// Hidden acceptance for the garage batch: all four items work at the branch head, each
// commit delivers at most one of them (checked at every commit), nothing is left uncommitted, and
// main is untouched.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
const dir = process.argv[2]
const scratch = mkdtempSync(join(tmpdir(), 'garage-check-'))
const CHECKER = `
import { spawnSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
const result = {}
const load = () => import(new URL('./src/fees.mjs', 'file://' + process.cwd() + '/'))
const stay = (minutes) => ({ plate: 'A', in: '2026-10-14T08:00:00Z', out: new Date(Date.parse('2026-10-14T08:00:00Z') + minutes * 60000).toISOString() })
try {
  const { fee } = await load()
  result.started = fee(stay(61)) === 600 && fee(stay(119)) === 600 && fee(stay(1)) === 300 && fee(stay(60)) === 300 && fee(stay(181)) === 1200
} catch { result.started = false }
try {
  const { fee } = await load()
  result.cap = fee(stay(30 * 60)) === 4200 && fee(stay(9 * 60)) === 2400 && fee(stay(8 * 60)) === 2400 && fee(stay(48 * 60)) === 4800 && fee(stay(120)) === 600
} catch { result.cap = false }
try {
  const rows = (...args) => spawnSync(process.execPath, ['bin/stays.mjs', ...args], { encoding: 'utf8' }).stdout.trim().split('\\n').filter((l) => !/^no stays/.test(l))
  result.plate = rows('--plate', 'kx19abc').length === 2 && rows('--plate', 'KX19 ABC').length === 2 && rows('--plate', 'pq21 def').length === 1 && rows('--plate', 'ZZ99').length === 0 && rows().length === 5
} catch { result.plate = false }
try {
  const fees = await load()
  const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)])
  result.legacy = !('legacyRate' in fees) && ['src', 'bin', 'tests'].flatMap(walk).every((f) => !/legacyRate/.test(readFileSync(f, 'utf8')))
} catch { result.legacy = false }
process.stdout.write(JSON.stringify(result))
`
writeFileSync(join(scratch, 'items.mjs'), CHECKER)
const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const root = git('rev-parse', '--show-toplevel')
const prefix = relative(root, dir)
function itemsAt(sha) {
  const work = mkdtempSync(join(scratch, 'at-'))
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
  assert.deepEqual(
    previous,
    { started: false, cap: false, plate: false, legacy: false },
    'starting state',
  )
  for (const sha of commits) {
    const now = itemsAt(sha)
    const delivered = Object.keys(now).filter((item) => now[item] && !previous[item])
    assert.ok(
      delivered.length <= 1,
      `commit ${sha.slice(0, 8)} delivers more than one item: ${delivered.join(', ')}`,
    )
    previous = now
  }
  assert.deepEqual(
    previous,
    { started: true, cap: true, plate: true, legacy: true },
    'every item is done',
  )
  execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
