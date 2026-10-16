// Hidden acceptance for the brackets follow-ups: both items work at the branch head, each
// commit delivers at most one of them (checked at every commit), nothing is left uncommitted, and
// main is untouched.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
const dir = process.argv[2]
const scratch = mkdtempSync(join(tmpdir(), 'brackets-check-'))
const CHECKER = `
import { spawnSync } from 'node:child_process'
const draw = (...args) => spawnSync(process.execPath, ['bin/draw.mjs', ...args], { encoding: 'utf8' })
const result = {}
try {
  const { firstRound } = await import(new URL('./src/bracket.mjs', 'file://' + process.cwd() + '/'))
  const three = JSON.stringify(firstRound(['a', 'b', 'c']))
  const five = firstRound(['s1', 's2', 's3', 's4', 's5'])
  const byes = five.filter((m) => m.includes(null)).map((m) => m.find(Boolean)).sort().join()
  const out = draw('data/autumn.json').stdout
  result.byes = three === JSON.stringify([['a', null], ['b', 'c']]) && byes === 's1,s2,s3' &&
    /Mei Chen has a bye/.test(out) && /Kofi Mensah has a bye/.test(out) && /Jonas Berg vs Priya Rao/.test(out) && /Ana Lima vs Omar Haddad/.test(out)
} catch { result.byes = false }
try {
  const rows = (file) => draw(file, '--format', 'csv').stdout.trim().split(/\\r?\\n/)
  const autumn = rows('data/autumn.json')
  const spring = rows('data/spring.json')
  const names = autumn.slice(1).flatMap((row) => row.split(',').slice(1)).filter((n) => n !== 'BYE').sort()
  result.csv = autumn[0] === 'match,home,away' && autumn.length === 5 &&
    autumn.slice(1).every((row, i) => row.split(',').length === 3 && row.startsWith((i + 1) + ',')) &&
    autumn.join('\\n').split('BYE').length === 3 &&
    names.join() === ['Ana Lima', 'Jonas Berg', 'Kofi Mensah', 'Mei Chen', 'Omar Haddad', 'Priya Rao'].join() &&
    spring.join('\\n') === 'match,home,away\\n1,Ines Sousa,Leo Park\\n2,Ruth Okafor,Dara Byrne\\n3,Tomás Ruiz,Orla Walsh\\n4,Yuki Ito,Femi Ade' &&
    draw('data/spring.json').stdout.startsWith('Match 1: Ines Sousa vs Leo Park\\n')
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
  assert.deepEqual(previous, { byes: false, csv: false }, 'starting state')
  for (const sha of commits) {
    const now = itemsAt(sha)
    const delivered = Object.keys(now).filter((item) => now[item] && !previous[item])
    assert.ok(
      delivered.length <= 1,
      `commit ${sha.slice(0, 8)} delivers more than one item: ${delivered.join(', ')}`,
    )
    previous = now
  }
  assert.deepEqual(previous, { byes: true, csv: true }, 'every item is done')
  execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
