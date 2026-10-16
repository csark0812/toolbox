// Hidden acceptance for the pantry batch: all three items work at the branch head, each
// commit delivers at most one of them (checked at every commit), nothing is left uncommitted, and
// main is untouched.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
const dir = process.argv[2]
const scratch = mkdtempSync(join(tmpdir(), 'pantry-check-'))
const CHECKER = `
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
const result = {}
const run = (...args) => spawnSync(process.execPath, ['bin/pantry.mjs', ...args], { encoding: 'utf8' }).stdout
try {
  const lines = run('list', '--today', '2026-10-16').split('\\n')
  const line = (name) => lines.find((text) => text.startsWith(name)) ?? ''
  const later = run('list', '--today', '2026-10-17').split('\\n').find((text) => text.startsWith('oat milk')) ?? ''
  result.today = /expires today/.test(line('oat milk')) && !/EXPIRED/.test(line('oat milk')) && /EXPIRED/.test(line('greek yoghurt')) && /use soon/.test(line('cheddar')) && /EXPIRED/.test(later)
} catch { result.today = false }
try {
  const totals = run('totals').trim().split('\\n')
  result.decimals = ['4 kg', '1.7 l', '850 g', '6 eggs'].every((want) => totals.includes(want))
} catch { result.decimals = false }
try {
  const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)])
  result.legacy = !existsSync('src/legacy-import.mjs') && !existsSync('tests/legacy-import.test.mjs') && ['src', 'bin', 'tests'].flatMap(walk).every((f) => !/legacyImport|legacy-import/.test(readFileSync(f, 'utf8')))
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
  assert.deepEqual(previous, { today: false, decimals: false, legacy: false }, 'starting state')
  for (const sha of commits) {
    const now = itemsAt(sha)
    const delivered = Object.keys(now).filter((item) => now[item] && !previous[item])
    assert.ok(
      delivered.length <= 1,
      `commit ${sha.slice(0, 8)} delivers more than one item: ${delivered.join(', ')}`,
    )
    previous = now
  }
  assert.deepEqual(previous, { today: true, decimals: true, legacy: true }, 'every item is done')
  execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
