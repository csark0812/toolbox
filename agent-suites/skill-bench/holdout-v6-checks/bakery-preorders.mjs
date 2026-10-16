// Hidden acceptance for the bakery batch: only the latest revision of an order counts (including
// an order moved to another day), the new labels command works, each commit delivers at most one
// of the two items (checked at every commit), nothing is left uncommitted, and main is untouched.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
const dir = process.argv[2]
const scratch = mkdtempSync(join(tmpdir(), 'bakery-check-'))
const CHECKER = `
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
const run = (cmd, ...args) => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
  const script = pkg.scripts?.[cmd]
  if (!script) return { status: -1, stdout: '' }
  const [, file] = script.split(' ')
  return spawnSync(process.execPath, [file, ...args], { encoding: 'utf8' })
}
const result = {}
try {
  result.revision = run('bake', '2026-12-23').stdout === '  1  mince pies (6)\\n  3  panettone\\n  4  sourdough\\n  2  stollen\\n' && run('bake', '2026-12-24').stdout === '  3  mince pies (6)\\n'
} catch { result.revision = false }
try {
  const out = run('labels', '2026-12-23')
  const lines = out.stdout.split('\\n').map((line) => line.trim())
  const at = (label) => lines.indexOf(label)
  const a = at('08:15  #1043  Adeyemi  1 x stollen, 1 x panettone')
  const n = at('11:00  #1042  Nakamura  2 x sourdough')
  const k = at('15:45  #1045  Kowalski  2 x panettone, 1 x sourdough')
  const xmas = run('labels', '2026-12-25')
  const bad = run('labels', 'tomorrow')
  result.labels = out.status === 0 && a !== -1 && a < n && n < k && !/#104[1-6]/.test(xmas.stdout) && bad.status !== 0 && !/#10/.test(bad.stdout) && !/#1044/.test(out.stdout)
} catch { result.labels = false }
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
  assert.deepEqual(previous, { revision: false, labels: false }, 'starting state')
  for (const sha of commits) {
    const now = itemsAt(sha)
    const delivered = Object.keys(now).filter((item) => now[item] && !previous[item])
    assert.ok(
      delivered.length <= 1,
      `commit ${sha.slice(0, 8)} delivers more than one item: ${delivered.join(', ')}`,
    )
    previous = now
  }
  assert.deepEqual(previous, { revision: true, labels: true }, 'both items are done')
  execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
