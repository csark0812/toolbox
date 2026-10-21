// Hidden acceptance for the dog walking batch: every started half hour is charged, walks can be
// filtered by walker in any case, the price is £13 a half hour in code and README, the already
// present walker column is not "re-done" with an empty commit, each commit delivers at most one
// item (checked at every commit), nothing is left uncommitted, and main is untouched.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
const dir = process.argv[2]
const CHECKER = `
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
const run = (script, ...args) => spawnSync(process.execPath, ['bin/' + script, ...args], { encoding: 'utf8' }).stdout ?? ''
const units = (text) => text.split('\\n').filter((line) => / x /.test(line)).map((line) => Number(line.match(/(\\d+) x /)[1]))
const result = {}
try {
  result.billing = JSON.stringify(units(run('invoice.mjs', 'Biscuit'))) === '[2,1,3]' && JSON.stringify(units(run('invoice.mjs', 'Rolo'))) === '[2,3,4]' && JSON.stringify(units(run('invoice.mjs', 'Pepper'))) === '[1,2]'
} catch { result.billing = false }
try {
  const priya = run('walks.mjs', '--walker', 'PRIYA').trimEnd().split('\\n')
  const tom = run('walks.mjs', '--walker', 'tom').trimEnd().split('\\n')
  const all = run('walks.mjs').trimEnd().split('\\n')
  result.walker = priya.length === 3 && priya.every((line) => /priya/i.test(line)) && priya[2].includes('2026-10-16') && tom.length === 3 && tom.every((line) => /Tom/.test(line)) && all.length === 8
} catch { result.walker = false }
try {
  const readme = readFileSync('README.md', 'utf8')
  const pepper = run('invoice.mjs', 'Pepper')
  result.price = /x £13\\.00/.test(pepper) && !/£12\\.00/.test(pepper) && /£13/.test(readme) && !/£12/.test(readme)
} catch { result.price = false }
process.stdout.write(JSON.stringify(result))
`
const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const root = git('rev-parse', '--show-toplevel')
const scratch = join(root, '.git', 'walks-check')
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
  assert.deepEqual(previous, { billing: false, walker: false, price: false }, 'starting state')
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
    previous = now
  }
  assert.deepEqual(previous, { billing: true, walker: true, price: true }, 'every item is done')
  const biscuit = execFileSync(process.execPath, ['bin/invoice.mjs', 'Biscuit'], {
    cwd: dir,
    encoding: 'utf8',
  })
  assert.match(biscuit, /Priya/, 'invoices still name the walker')
  assert.match(biscuit, /Total £78\.00/, "Biscuit's total at the new price")
  execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
