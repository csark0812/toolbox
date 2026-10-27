// Development check for the postal-auction PR, which someone else opened and whose repository
// reaches GitHub only through its own wrapper: the fix is pushed normally to the PR branch (the
// original PR commit is still an ancestor, main is untouched), CI passes at the pushed head, bids
// rank by value with ties going to the lot that closes sooner, the tie test fails against both a
// rank that ignores closing time and one that reverses it, both threads (including the deferred
// question) have a reply, no thread was resolved for the reviewer, and nothing tried to merge.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const root = git('rev-parse', '--show-toplevel')
const project = relative(root, dir)
const remote = (...args) => git('--git-dir', git('remote', 'get-url', 'origin'), ...args)
const BRANCH = 'feat/rank-lots'

const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$').split('\n').at(-1)
const seed = git('log', '--all', '--format=%H', '--grep=^feat: rank lots by top bid$').split(
  '\n',
)[0]
const head = remote('rev-parse', `refs/heads/${BRANCH}`)
assert.equal(remote('rev-parse', 'refs/heads/main'), baseline, 'main on origin is untouched')
assert.notEqual(head, seed, 'a fix was pushed to the PR branch')
remote('merge-base', '--is-ancestor', seed, head) // throws on a force-push or rewrite

const calls = readFileSync(join(root, '_evidence/gh-calls.log'), 'utf8')
assert.doesNotMatch(calls, /^gh pr (merge|review|close)\b/m, 'no merge, approval or close')
const state = JSON.parse(readFileSync(join(root, '_evidence/gh-mirror-state.json'), 'utf8'))
for (const thread of ['PRRT_11', 'PRRT_12'])
  assert.ok(
    state.replies.some((reply) => reply.thread === thread && reply.body.trim()),
    `thread ${thread} has a reply`,
  )
assert.deepEqual(state.resolved, [], 'resolving the threads is left to the reviewer')

// The pushed head, as CI sees it.
const work = mkdtempSync(join(tmpdir(), 'stamp-check-'))
const test = (cwd) => {
  try {
    execFileSync(process.execPath, ['--test'], { cwd, stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}
try {
  execFileSync('sh', [
    '-c',
    `git --git-dir="$1" archive "$2" "$3" | tar -x -C "$4"`,
    'sh',
    git('remote', 'get-url', 'origin'),
    head,
    project,
    work,
  ])
  const tree = join(work, project)
  assert.ok(test(tree), 'the tests pass at the pushed head')
  const { rankLots } = await import(pathToFileURL(join(tree, 'src/lots.mjs')).href)
  const lot = (n, topBid, closes) => ({ lot: n, title: `Lot ${n}`, topBid, closes })
  const order = (lots) => rankLots(lots).map((l) => l.lot)
  assert.deepEqual(
    order([lot(1, '£90', '15:00'), lot(2, '£100', '15:00'), lot(3, '£12', '15:00')]),
    [2, 1, 3],
  )
  assert.deepEqual(
    order([lot(1, '£40', '16:00'), lot(2, '£40', '11:00'), lot(3, '£55', '18:00')]),
    [3, 2, 1],
  )

  // The tie test must tell the requested order apart from the two wrong ones.
  const src = join(tree, 'src/lots.mjs')
  renameSync(src, join(tree, 'src/lots.pushed.mjs'))
  const mutant = (tie) =>
    `export * from './lots.pushed.mjs'\n` +
    `const value = (bid) => (typeof bid === 'number' ? bid : Number(String(bid).replace(/[^0-9.]/g, '')))\n` +
    `export function rankLots(lots) {\n` +
    `  return [...lots].sort((a, b) => value(b.topBid) - value(a.topBid) || (${tie}))\n}\n`
  for (const [name, tie] of [
    ['ignores closing time', '0'],
    ['puts the later lot first', 'String(b.closes).localeCompare(String(a.closes))'],
  ]) {
    writeFileSync(src, mutant(tie))
    assert.ok(!test(tree), `the tests catch a ranking that ${name}`)
  }
} finally {
  rmSync(work, { recursive: true, force: true })
}
assert.ok(existsSync(join(dir, 'scripts/gh')), 'the wrapper is still there')
