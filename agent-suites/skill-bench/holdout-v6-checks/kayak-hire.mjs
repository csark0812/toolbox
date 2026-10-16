// Hidden acceptance for the kayak-hire batch: all three items are done at the branch head, each
// commit delivers at most one of them (checked at every commit), nothing is left uncommitted,
// and main is untouched.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
const dir = process.argv[2]
const scratch = mkdtempSync(join(tmpdir(), 'kayak-check-'))
const CHECKER = `
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
const run = (script, ...args) => spawnSync(process.execPath, ['bin/' + script, ...args], { encoding: 'utf8' })
const result = {}
try {
  const b202 = run('bill.mjs', 'B202').stdout
  const b203 = run('bill.mjs', 'B203').stdout
  const b204 = run('bill.mjs', 'B204').stdout
  result.fee = !/Late fee/.test(b202) && /Refund\\s+£25\\.00/.test(b202) && /Late fee\\s+£5\\.00/.test(b203) && /Refund\\s+£20\\.00/.test(b203) && /Late fee\\s+£15\\.00/.test(b204)
} catch { result.fee = false }
try {
  const ids = (out) => (out.match(/^B\\d+/gm) ?? []).join(',')
  const all = run('bookings.mjs')
  const day = run('bookings.mjs', '--date', '2026-07-12')
  const none = run('bookings.mjs', '--date', '2026-07-14')
  const bad = run('bookings.mjs', '--date', 'tomorrow')
  const badDay = run('bookings.mjs', '--date', '2026-13-40')
  result.date = ids(all.stdout) === 'B201,B202,B203,B204,B205' && day.status === 0 && ids(day.stdout) === 'B203,B204' && ids(none.stdout) === '' && bad.status !== 0 && ids(bad.stdout) === '' && badDay.status !== 0 && ids(badDay.stdout) === ''
} catch { result.date = false }
try {
  const readme = readFileSync('README.md', 'utf8')
  result.docs = /£25/.test(readme) && !/£20\\b/.test(readme)
} catch { result.docs = false }
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
  assert.deepEqual(previous, { fee: false, date: false, docs: false }, 'starting state')
  for (const sha of commits) {
    const now = itemsAt(sha)
    const delivered = Object.keys(now).filter((item) => now[item] && !previous[item])
    assert.ok(
      delivered.length <= 1,
      `commit ${sha.slice(0, 8)} delivers more than one item: ${delivered.join(', ')}`,
    )
    previous = now
  }
  assert.deepEqual(previous, { fee: true, date: true, docs: true }, 'every item is done')
  execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
