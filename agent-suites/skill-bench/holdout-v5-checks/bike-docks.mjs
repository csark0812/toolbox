// Hidden acceptance for the bike-docks batch: all three items work at the branch head, each
// commit delivers at most one of them (checked at every commit), nothing is left uncommitted, and
// main is untouched.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
const dir = process.argv[2]
const scratch = mkdtempSync(join(tmpdir(), 'docks-check-'))
const CHECKER = `
import { spawnSync } from 'node:child_process'
const result = {}
const status = (...args) => {
  const run = spawnSync(process.execPath, ['bin/docks.mjs', 'status', ...args], { encoding: 'utf8' })
  if (run.status !== 0) return null
  return run.stdout.trim().split('\\n').filter(Boolean).map((line) => {
    const m = /^(.+?)\\s{2,}(\\d+) bikes?, (\\d+) spaces?$/.exec(line.trim())
    return m ? { name: m[1], bikes: Number(m[2]), spaces: Number(m[3]) } : { name: line, bikes: NaN }
  })
}
try {
  const rows = status()
  const of = (name) => rows.find((row) => row.name === name)?.bikes
  result.count = of('Canal Basin') === 2 && of('Hospital Road') === 0 && of('Station Forecourt') === 6 && of('Abbey Gardens') === 2 && of('Market Cross') === 0 && of('University Library') === 4
} catch { result.count = false }
try {
  const rows = status()
  const all = rows.map((row) => row.name).join('|')
  const below = (n) => (status('--below', String(n)) ?? [{ name: '?' }]).map((row) => row.name).sort().join('|')
  const want = (n) => rows.filter((row) => row.bikes < n).map((row) => row.name).sort().join('|')
  result.below = rows.length === 6 && [1, 3, 5, 100].every((n) => below(n) === want(n)) && below(100) !== '' && all.length > 0 && below(1) !== below(100)
} catch { result.below = false }
try {
  const rows = status()
  const sorted = [...rows].sort((a, b) => a.bikes - b.bikes || (a.name < b.name ? -1 : 1))
  result.sort = rows.length === 6 && rows.every((row, i) => row.name === sorted[i].name) && rows[0].name !== 'Abbey Gardens'
} catch { result.sort = false }
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
  assert.deepEqual(previous, { count: false, below: false, sort: false }, 'starting state')
  for (const sha of commits) {
    const now = itemsAt(sha)
    const delivered = Object.keys(now).filter((item) => now[item] && !previous[item])
    assert.ok(
      delivered.length <= 1,
      `commit ${sha.slice(0, 8)} delivers more than one item: ${delivered.join(', ')}`,
    )
    previous = now
  }
  assert.deepEqual(previous, { count: true, below: true, sort: true }, 'every item is done')
  execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
