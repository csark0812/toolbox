// Hidden acceptance for the CFP batch: all four items work at the branch head, each
// commit delivers at most one of them (checked at every commit), nothing is left uncommitted, and
// main is untouched.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
const dir = process.argv[2]
const scratch = mkdtempSync(join(tmpdir(), 'cfp-check-'))
const CHECKER = `
import { spawnSync } from 'node:child_process'
const result = {}
const run = (...args) => {
  const out = spawnSync(process.execPath, ['bin/cfp.mjs', ...args], { encoding: 'utf8' })
  return out.status === 0 ? out.stdout : null
}
function parseCsv(text) {
  const rows = [[]]
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (c === '"') quoted = false
      else field += c
    } else if (c === '"' && field === '') quoted = true
    else if (c === ',') { rows.at(-1).push(field); field = '' }
    else if (c === '\\n') { rows.at(-1).push(field); field = ''; rows.push([]) }
    else if (c !== '\\r') field += c
  }
  if (field !== '' || rows.at(-1).length) rows.at(-1).push(field)
  return rows.filter((row) => row.length > 1 || row[0])
}
try {
  const out = run('check') ?? ''
  result.words = /#4 .*\\b122 words/.test(out) && !/#[1235] /.test(out)
} catch { result.words = false }
try {
  const rows = parseCsv(run('export') ?? '')
  const title = (id) => rows.find((row) => row[0] === String(id))?.[1]
  result.csv = rows.length === 6 && rows.every((row) => row.length === rows[0].length) && title(2) === 'Forms, but accessible' && title(3) === 'Edge caching, "the boring way"'
} catch { result.csv = false }
try {
  const ids = (track) => (run('export', '--track', track) ?? '').trim().split('\\n').slice(1).map((line) => line.split(',')[0]).join(' ')
  result.track = ids('ux') === '2 4' && ids('Performance') === '1 3' && ids('PERFORMANCE') === '1 3' && ids('Keynote') === ''
} catch { result.track = false }
try {
  const lines = (run('speakers') ?? '').trim().split('\\n')
  result.speakers = lines.length === 4 && lines.some((line) => /^Nia Okoro .*: 2$/.test(line)) && lines.filter((line) => line.startsWith('Nia')).length === 1
} catch { result.speakers = false }
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
    { words: false, csv: false, track: false, speakers: false },
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
    { words: true, csv: true, track: true, speakers: true },
    'every item is done',
  )
  execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
