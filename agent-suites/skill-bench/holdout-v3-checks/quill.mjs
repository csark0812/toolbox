// Hidden acceptance for the quill TODO batch: all three items work at the branch head, each
// commit delivers at most one of them (checked by running the probes at every commit), nothing is
// left uncommitted, and main is untouched.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
const dir = process.argv[2]
const scratch = mkdtempSync(join(tmpdir(), 'quill-check-'))

const words = (n) => Array.from({ length: n }, (_, i) => `word${i}`).join(' ')
const tagged = [
  {
    slug: 'long',
    title: 'Long one',
    date: '2026-10-01',
    author: 'A',
    tags: ['x'],
    body: words(522),
  },
  { slug: 'mid', title: 'Mid', date: '2026-10-02', author: 'A', tags: ['y'], body: words(650) },
  { slug: 'short', title: 'Short', date: '2026-10-03', author: 'A', tags: ['z'], body: words(140) },
  { slug: 'tiny', title: 'Tiny', date: '2026-10-04', author: 'A', tags: ['z'], body: 'Hi.' },
]
const untagged = [
  ...tagged,
  { slug: 'about', title: 'About', date: '2026-10-05', author: 'B', body: words(30) },
]
writeFileSync(join(scratch, 'tagged.json'), JSON.stringify(tagged))
writeFileSync(join(scratch, 'untagged.json'), JSON.stringify(untagged))

// Each probe runs in a copy of the project at one commit and reports whether its item works.
const PROBE = `
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
const scratch = ${JSON.stringify(scratch)}
const build = (...args) => execFileSync(process.execPath, ['bin/build.mjs', ...args], { encoding: 'utf8', stdio: 'pipe' })
const result = {}
try {
  build('--dry-run', '--data', join(scratch, 'untagged.json'))
  const { renderPost } = await import(new URL('./src/render.mjs', 'file://' + process.cwd() + '/'))
  const posts = JSON.parse(readFileSync(join(scratch, 'untagged.json'), 'utf8'))
  result.untagged = !renderPost(posts.at(-1)).includes('undefined')
} catch { result.untagged = false }
try {
  const { renderPost } = await import(new URL('./src/render.mjs', 'file://' + process.cwd() + '/'))
  const posts = JSON.parse(readFileSync(join(scratch, 'tagged.json'), 'utf8'))
  const want = ['3 min read', '4 min read', '1 min read', '1 min read']
  result.reading = posts.every((post, i) => {
    const html = renderPost(post)
    return html.includes(want[i]) && (html.match(/\\d+ min read/g) ?? []).length === 1
  })
} catch { result.reading = false }
try {
  const { spawnSync } = await import('node:child_process')
  const a = mkdtempSync(join(scratch, 'a-'))
  const b = mkdtempSync(join(scratch, 'b-'))
  const run = (...args) => spawnSync(process.execPath, ['bin/build.mjs', '--data', join(scratch, 'tagged.json'), ...args], { encoding: 'utf8' })
  const fresh = run('--outdir', a)
  const old = run('--out', b)
  result.outdir = fresh.status === 0 && existsSync(join(a, 'index.html')) && existsSync(join(a, 'long.html')) && !/deprecat/i.test(fresh.stderr) &&
    old.status === 0 && existsSync(join(b, 'index.html')) && /deprecat/i.test(old.stderr)
} catch { result.outdir = false }
process.stdout.write(JSON.stringify(result))
`
writeFileSync(join(scratch, 'probe.mjs'), PROBE)

const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const root = git('rev-parse', '--show-toplevel')
const prefix = relative(root, dir)
function probeAt(sha) {
  const work = mkdtempSync(join(scratch, 'at-'))
  execFileSync('sh', ['-c', `git -C "${root}" archive ${sha} "${prefix}" | tar -x -C "${work}"`])
  return JSON.parse(
    execFileSync(process.execPath, [join(scratch, 'probe.mjs')], {
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
  let previous = probeAt(baseline)
  assert.deepEqual(previous, { untagged: false, reading: false, outdir: false }, 'starting state')
  for (const sha of commits) {
    const now = probeAt(sha)
    const delivered = Object.keys(now).filter((item) => now[item] && !previous[item])
    assert.ok(
      delivered.length <= 1,
      `commit ${sha.slice(0, 8)} delivers more than one item: ${delivered.join(', ')}`,
    )
    previous = now
  }
  assert.deepEqual(previous, { untagged: true, reading: true, outdir: true }, 'every item is done')
  execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
