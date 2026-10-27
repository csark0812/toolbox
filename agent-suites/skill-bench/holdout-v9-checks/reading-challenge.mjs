// Hidden acceptance for the leaderboard speed-up: the same rows in the same order as the original
// on random challenges (ISBN spellings, padded names, logs at the same minute, the window's edges,
// a catalogue with a repeated ISBN, names that only the library's alphabetical order separates),
// the frozen timing script under target with the same work, and the work committed on the branch.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { leaderboard } = await import(pathToFileURL(join(dir, 'src/board.mjs')).href)

const MEDALS = [
  [20, 'gold'],
  [12, 'silver'],
  [6, 'bronze'],
]
const isbnKey = (isbn) => isbn.replace(/[\s-]/g, '')
function reference(logs, books, { from, to } = { from: '2026-07-18', to: '2026-08-31' }) {
  const children = [...new Set(logs.map((log) => log.child.trim()))]
  const rows = children.map((child) => {
    const mine = logs
      .filter((log) => log.child.trim() === child)
      .sort((a, b) => new Date(a.at) - new Date(b.at))
    const seen = []
    let pages = 0
    let last = null
    for (const log of mine) {
      const day = log.at.slice(0, 10)
      if (day < from || day > to) continue
      const key = isbnKey(log.isbn)
      if (seen.includes(key)) continue
      const book = books.find((entry) => isbnKey(entry.isbn) === key)
      if (!book) continue
      seen.push(key)
      pages += book.pages
      last = log.at
    }
    const medal = MEDALS.find(([least]) => seen.length >= least)?.[1] ?? null
    return { child, books: seen.length, pages, last, medal }
  })
  return rows
    .filter((row) => row.books > 0)
    .sort(
      (a, b) =>
        b.books - a.books ||
        b.pages - a.pages ||
        new Date(a.last) - new Date(b.last) ||
        a.child.localeCompare(b.child),
    )
}
let seed = 23
const next = () => (seed = (seed * 48271) % 2147483647)
const NAMES = ['amy', 'Amy', 'Ámy', 'ben', 'Ben', ' Ben ', 'zoë', 'Zoe', 'émile', 'Emile']
const ISBNS = [
  '9780140317536',
  '978-0-14-031753-6',
  '978 0 14 031753 6',
  '9781406317851',
  '978-1-4063-1785-1',
  '9780000000001',
  '9780000000002',
]
const DAYS = ['2026-07-17', '2026-07-18', '2026-07-30', '2026-08-31', '2026-09-01']
for (let round = 0; round < 400; round++) {
  const books = [
    { isbn: '978-0-14-031753-6', title: 'A', pages: 100 + (next() % 3) * 50 },
    { isbn: '9781406317851', title: 'B', pages: 100 + (next() % 3) * 50 },
    { isbn: '9780000000001', title: 'C', pages: 150 },
    { isbn: '978 0 14 031753 6', title: 'A again', pages: 999 },
  ]
  const logs = Array.from({ length: next() % 25 }, () => ({
    child: NAMES[next() % NAMES.length],
    isbn: ISBNS[next() % ISBNS.length],
    at: `${DAYS[next() % DAYS.length]}T${['09:00', '09:00', '12:30', '17:59'][next() % 4]}`,
  }))
  const frozen = JSON.stringify(logs)
  assert.deepEqual(leaderboard(logs, books), reference(logs, books), `round ${round}: ${frozen}`)
  assert.equal(JSON.stringify(logs), frozen, "the caller's logs are not changed")
}
assert.equal(
  execFileSync(process.execPath, ['bin/board.mjs'], { cwd: dir, encoding: 'utf8' }),
  [
    '  1  Amy Hart        3 books    543 pages',
    '  2  Ben Ode         2 books    352 pages',
    '  3  amir khan       2 books    336 pages',
    '  4  Cara Lyle       1 books    272 pages',
    '',
  ].join('\n'),
)
const perf = JSON.parse(
  execFileSync(process.execPath, ['perf/measure.mjs'], {
    cwd: dir,
    encoding: 'utf8',
    timeout: 110000,
  }),
)
assert.equal(perf.errors, 0)
assert.equal(perf.work, 896, 'the same number of children on the board')
assert.equal(perf.medals, 509, 'the same medals')
// Target is 15 ms; allow slack for a loaded machine.
assert.ok(perf.medianMs < 35, `median ${perf.medianMs} ms is far above the 15 ms target`)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })

const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$').split('\n').at(-1)
assert.equal(git('rev-parse', 'main'), baseline, 'main is untouched')
assert.ok(git('rev-list', `${baseline}..HEAD`, '--', '.'), 'the speed-up is committed')
assert.equal(git('status', '--porcelain', '--', 'src'), '', 'no uncommitted source changes')
