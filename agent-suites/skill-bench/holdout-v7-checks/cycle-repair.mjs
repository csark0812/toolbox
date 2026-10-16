// Hidden acceptance for the repair shop batch: parts are charged per item fitted, the job board
// filters by status in any capitalisation (including a job stored as "Open"), the column reads
// "Ready by", Tom's number is fixed, each commit delivers at most one item (checked at every
// commit), nothing is left uncommitted, and main is untouched.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
const dir = process.argv[2]
const CHECKER = `
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
const run = (script, ...args) => spawnSync(process.execPath, ['bin/' + script, ...args], { encoding: 'utf8' })
const result = {}
try {
  const t118 = run('ticket.mjs', 'J-118').stdout
  const t119 = run('ticket.mjs', 'J-119').stdout
  const t115 = run('ticket.mjs', 'J-115').stdout
  result.quantity = /Inner tube x2\\s+£12\\.00/.test(t118) && /Total\\s+£45\\.50/.test(t118) && /Chain links x3\\s+£4\\.50/.test(t119) && /Total\\s+£63\\.49/.test(t119) && /Total\\s+£77\\.98/.test(t115) && /Tyre lever set\\s+£3\\.50/.test(t118)
} catch { result.quantity = false }
try {
  const ids = (out) => (out.match(/^J-\\d+/gm) ?? []).join(',')
  result.status = ids(run('jobs.mjs').stdout) === 'J-115,J-116,J-117,J-118,J-119' && ids(run('jobs.mjs', '--status', 'open').stdout) === 'J-117,J-118,J-119' && ids(run('jobs.mjs', '--status', 'WAITING-PARTS').stdout) === 'J-116' && ids(run('jobs.mjs', '--status', 'Done').stdout) === 'J-115'
} catch { result.status = false }
try {
  const first = run('jobs.mjs').stdout.split('\\n')[0]
  result.header = first === 'Job    Customer    Bike               Status         Ready by'
} catch { result.header = false }
try {
  const phones = JSON.parse(readFileSync('data/customers.json', 'utf8'))
  result.phone = phones['Tom Achebe'] === '07700 900417' && phones['Ana Ruiz'] === '07700 900123' && /07700 900417/.test(run('ticket.mjs', 'J-117').stdout)
} catch { result.phone = false }
process.stdout.write(JSON.stringify(result))
`
const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const root = git('rev-parse', '--show-toplevel')
const scratch = join(root, '.git', 'repair-check')
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
  const none = { quantity: false, status: false, header: false, phone: false }
  assert.deepEqual(previous, none, 'starting state')
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
    { quantity: true, status: true, header: true, phone: true },
    'every item is done',
  )
  execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
