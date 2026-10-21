// Hidden acceptance for the toy library batch: a toy back on its due date is not late (and every
// other fine loses its extra day), --csv prints the fines with a quoted family name, fines are
// capped at £2 a toy in code and README, each commit delivers at most one item (checked at
// every commit), nothing is left uncommitted, and main is untouched.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
const dir = process.argv[2]
const CHECKER = `
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
const run = (...args) => spawnSync(process.execPath, ['bin/fines.mjs', '--today', '2026-11-02', ...args], { encoding: 'utf8' }).stdout ?? ''
const text = run()
const fineOf = (family) => (text.split('\\n').find((line) => line.trim().startsWith(family)) ?? '').match(/£(\\d+\\.\\d\\d)/)?.[1]
const result = {}
try {
  result.dueDay = !/Garcia/.test(text) && fineOf('Okoro') === '0.40' && fineOf('Ng & Tran') === '1.20'
} catch { result.dueDay = false }
try {
  const rows = run('--csv').trimEnd().split('\\n')
  const families = text.split('\\n').slice(1).filter((line) => /£/.test(line)).length
  result.csv = rows[0] === 'family,toys,fine' && rows.length === families + 1 && rows[1] === '"Baker, J.",2,' + fineOf('Baker') && rows.includes('Okoro,1,' + fineOf('Okoro')) && rows.includes('Ng & Tran,1,' + fineOf('Ng & Tran')) && !/£/.test(rows.join(''))
} catch { result.csv = false }
try {
  const readme = readFileSync('README.md', 'utf8')
  result.cap = ['2.60', '2.80'].includes(fineOf('Baker')) && /£2\\b|£2\\.00/.test(readme)
} catch { result.cap = false }
process.stdout.write(JSON.stringify(result))
`
const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const root = git('rev-parse', '--show-toplevel')
const scratch = join(root, '.git', 'toys-check')
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
  assert.deepEqual(previous, { dueDay: false, csv: false, cap: false }, 'starting state')
  for (const sha of commits) {
    const now = itemsAt(sha)
    const delivered = Object.keys(now).filter((item) => now[item] && !previous[item])
    assert.ok(
      delivered.length <= 1,
      `commit ${sha.slice(0, 8)} delivers more than one item: ${delivered.join(', ')}`,
    )
    previous = now
  }
  assert.deepEqual(previous, { dueDay: true, csv: true, cap: true }, 'every item is done')
  assert.equal(
    execFileSync(process.execPath, ['bin/fines.mjs', '--today', '2026-11-02', '--csv'], {
      cwd: dir,
      encoding: 'utf8',
    }),
    'family,toys,fine\n"Baker, J.",2,2.60\nNg & Tran,1,1.20\nOkoro,1,0.40\n',
    'the final fines',
  )
  execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
