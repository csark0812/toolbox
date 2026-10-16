// Hidden acceptance for the village hall batch: back-to-back bookings are allowed while real
// overlaps still clash, the hall closes at 23:00 in code and README, the week view ends with
// each room's total hours, each commit delivers at most one item (checked at every commit),
// nothing is left uncommitted, and main is untouched.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
const dir = process.argv[2]
const CHECKER = `
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
const run = (script, ...args) => spawnSync(process.execPath, ['bin/' + script, ...args], { encoding: 'utf8' })
const ok = (...args) => run('request.mjs', ...args).status === 0
const result = {}
try {
  result.adjacent = ok('main', '2026-10-22', '18:00', '19:30') && ok('small', '2026-10-21', '12:30', '13:00') && ok('main', '2026-10-20', '17:00', '19:00') && !ok('main', '2026-10-22', '17:30', '19:00') && !ok('main', '2026-10-22', '18:00', '19:31') && !ok('main', '2026-10-22', '16:00', '21:00')
} catch { result.adjacent = false }
try {
  const readme = readFileSync('README.md', 'utf8')
  result.closing = ok('main', '2026-10-24', '22:00', '23:00') && ok('small', '2026-10-24', '21:00', '23:00') && !ok('main', '2026-10-24', '22:30', '23:30') && !ok('main', '2026-10-24', '07:00', '09:00') && /23:00/.test(readme) && !/22:00/.test(readme)
} catch { result.closing = false }
try {
  const lines = run('week.mjs', '2026-10-19').stdout.trimEnd().split('\\n')
  const empty = run('week.mjs', '2026-11-02').stdout.trimEnd().split('\\n')
  result.totals = lines.at(-2) === 'Main hall: 12.5 h' && lines.at(-1) === 'Small room: 4.0 h' && lines[11] === '  Fri 23 Oct  18:30-20:00  Bridge Club' && empty.at(-2) === 'Main hall: 0.0 h' && empty.at(-1) === 'Small room: 0.0 h'
} catch { result.totals = false }
process.stdout.write(JSON.stringify(result))
`
const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const root = git('rev-parse', '--show-toplevel')
const scratch = join(root, '.git', 'hall-check')
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
  assert.deepEqual(previous, { adjacent: false, closing: false, totals: false }, 'starting state')
  for (const sha of commits) {
    const now = itemsAt(sha)
    const delivered = Object.keys(now).filter((item) => now[item] && !previous[item])
    assert.ok(
      delivered.length <= 1,
      `commit ${sha.slice(0, 8)} delivers more than one item: ${delivered.join(', ')}`,
    )
    previous = now
  }
  assert.deepEqual(previous, { adjacent: true, closing: true, totals: true }, 'every item is done')
  execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
