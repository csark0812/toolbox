// Hidden acceptance for the choir register batch: rounding, join dates, --section and --csv are
// all done at the branch head, each commit delivers at most one of them (checked at every
// commit), nothing is left uncommitted, and main is untouched.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
const dir = process.argv[2]
const scratch = mkdtempSync(join(tmpdir(), 'choir-check-'))
const CHECKER = `
import { spawnSync } from 'node:child_process'
const report = (...args) => spawnSync(process.execPath, ['bin/report.mjs', ...args], { encoding: 'utf8' })
const rows = (out) => Object.fromEntries(out.split('\\n').map((line) => /^(\\S+ \\S+)\\s+(\\S+)\\s+(\\d+)\\/(\\d+)\\s*(.*)$/.exec(line)).filter(Boolean).map((m) => [m[1], { section: m[2], attended: Number(m[3]), possible: Number(m[4]), rest: m[5] }]))
const result = {}
try {
  const r = rows(report().stdout)
  result.round = r['Ana Ruiz'].rest.trim() === '67%' && r['Eve Larsen'].rest.trim() === '17%' && r['Cleo Marsh'].rest.trim() === '83%' && r['Finn Hale'].rest.trim() === '100%'
} catch { result.round = false }
try {
  const out = report().stdout
  const r = rows(out)
  result.joined = r['Ana Ruiz'].possible === 6 && r['Ben Ode'].possible === 4 && r['Dev Patel'].possible === 2 && r['Gus Moreau'].possible === 3 && r['Hana Sato'].possible === 0 && r['Ben Ode'].attended === 3 && !/NaN|Infinity/.test(out) && Object.keys(r).length === 8
} catch { result.joined = false }
try {
  const names = (out) => Object.keys(rows(out)).sort().join('|')
  const alto = report('--section', 'alto')
  const tenor = report('--section', 'TENOR')
  result.section = alto.status === 0 && names(alto.stdout) === 'Cleo Marsh|Eve Larsen' && names(tenor.stdout) === 'Ben Ode|Finn Hale' && Object.keys(rows(report().stdout)).length === 8
} catch { result.section = false }
try {
  const csv = report('--csv')
  const lines = csv.stdout.trim().split('\\n')
  const ana = lines.find((line) => line.startsWith('Ana Ruiz,'))
  result.csv = csv.status === 0 && lines[0] === 'name,section,attended,possible,percent' && lines.length === 9 && lines.slice(1).every((line) => line.split(',').length === 5) && /^Ana Ruiz,Soprano,4,\\d,/.test(ana ?? '')
} catch { result.csv = false }
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
    { round: false, joined: false, section: false, csv: false },
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
    { round: true, joined: true, section: true, csv: true },
    'every item is done',
  )
  execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
