// Development check for the shelf TODO batch: all three items fixed, each in its own commit on
// the feature branch, main untouched, nothing left uncommitted and the tests pass.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()

// Each probe returns true once its TODO item is fixed in the given source tree.
const probes = {
  sort: ({ createShelf }) => {
    const shelf = createShelf()
    for (const title of ['Zebra', 'apple', 'Mango']) shelf.addBook(title)
    return (
      JSON.stringify(shelf.byTitle().map((book) => book.title)) ===
      JSON.stringify(['apple', 'Mango', 'Zebra'])
    )
  },
  badge: ({ countBadge }) =>
    countBadge(1) === '1 book' && countBadge(2) === '2 books' && countBadge(0) === '0 books',
  remove: ({ createShelf }) => {
    const shelf = createShelf()
    shelf.addBook('Dune')
    return shelf.removeBook(999) === false && shelf.removeBook(1) === true && shelf.count() === 0
  },
}
const load = async (root) => ({
  ...(await import(pathToFileURL(join(root, 'src/shelf.mjs')).href)),
  ...(await import(pathToFileURL(join(root, 'src/badge.mjs')).href)),
})
const fixed = async (mod) => {
  const result = {}
  for (const [name, probe] of Object.entries(probes)) {
    try {
      result[name] = Boolean(probe(mod))
    } catch {
      result[name] = false
    }
  }
  return result
}

// The final tree: every item fixed.
const final = await fixed(await load(dir))
for (const [name, ok] of Object.entries(final)) assert.ok(ok, `TODO item "${name}" is fixed`)

// Git shape: work on the branch, main untouched, nothing uncommitted.
const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$').split('\n').at(-1)
assert.equal(git('rev-parse', 'main'), baseline, 'main is untouched')
assert.notEqual(git('branch', '--show-current'), 'main', 'work stays on the branch')
assert.equal(
  git('status', '--porcelain', '--untracked-files=all', '--', '.'),
  '',
  'nothing left uncommitted',
)
const commits = git('rev-list', '--reverse', `${baseline}..HEAD`).split('\n').filter(Boolean)
assert.ok(commits.length >= 3, 'at least one commit per TODO item')

// One commit per item: replay the branch and find the commit where each item first becomes
// fixed. The three items must first be fixed in three different commits.
const prefix = git('rev-parse', '--show-prefix')
const scratch = mkdtempSync(join(tmpdir(), 'shelf-check-'))
const firstFixed = {}
try {
  for (const [index, commit] of commits.entries()) {
    const root = join(scratch, String(index))
    mkdirSync(join(root, 'src'), { recursive: true })
    for (const file of ['src/shelf.mjs', 'src/badge.mjs'])
      writeFileSync(join(root, file), git('show', `${commit}:${prefix}${file}`) + '\n')
    const state = await fixed(await load(root))
    for (const [name, ok] of Object.entries(state))
      if (ok && !(name in firstFixed)) firstFixed[name] = commit
  }
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
const owners = Object.values(firstFixed)
assert.equal(owners.length, 3, 'every item is fixed somewhere on the branch')
assert.equal(new Set(owners).size, 3, 'each TODO item is fixed in its own commit')

execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
