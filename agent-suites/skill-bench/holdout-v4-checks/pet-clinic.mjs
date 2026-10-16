// Hidden acceptance for the pet-clinic TODO batch: all three items work at the branch head, each
// commit delivers at most one of them (checked at every commit), nothing is left uncommitted, and
// main is untouched.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
const dir = process.argv[2]
const scratch = mkdtempSync(join(tmpdir(), 'pet-clinic-check-'))
const CHECKER = `
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
const due = (...args) => spawnSync(process.execPath, ['bin/due.mjs', '--today', '2026-10-15', ...args], { encoding: 'utf8' })
const result = {}
try {
  const { status } = await import(new URL('./src/reminders.mjs', 'file://' + process.cwd() + '/'))
  const today = status('2026-10-15', '2026-10-15')
  const late = status('2026-10-14', '2026-10-15')
  const out = due().stdout
  result.today = !!today && today.kind !== 'overdue' && /due today/i.test(today.label) &&
    !!late && late.kind === 'overdue' && /^2026-10-15\\s+Biscuit.*due today/im.test(out) && !/Biscuit.*OVERDUE/.test(out)
} catch { result.today = false }
try {
  const pets = (run) => run.stdout.split('\\n').filter(Boolean).map((line) => line.split(/\\s+/)[1])
  const rabbit = due('--species', 'rabbit')
  const dogs = due('--species', 'DOG')
  const cats = due('--species', 'Cat')
  result.species = rabbit.status === 0 && pets(rabbit).join() === 'Clover' &&
    dogs.status === 0 && pets(dogs).join() === 'Biscuit,Pepper' &&
    cats.status === 0 && pets(cats).join() === 'Juno,Miso' && pets(due()).length === 5
} catch { result.species = false }
try {
  const readme = readFileSync('README.md', 'utf8')
  result.readme = /\\b10\\b|\\bten\\b/i.test(readme) && !/\\b14\\b/.test(readme)
} catch { result.readme = false }
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
  assert.deepEqual(previous, { today: false, species: false, readme: false }, 'starting state')
  for (const sha of commits) {
    const now = itemsAt(sha)
    const delivered = Object.keys(now).filter((item) => now[item] && !previous[item])
    assert.ok(
      delivered.length <= 1,
      `commit ${sha.slice(0, 8)} delivers more than one item: ${delivered.join(', ')}`,
    )
    previous = now
  }
  assert.deepEqual(previous, { today: true, species: true, readme: true }, 'every item is done')
  execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
