// Hidden acceptance for the catalogue speed-up: the same catalogue as the original on random
// libraries (composers differing only by case or accents, blank, padded or missing composers
// filed as Trad., numbered titles read as numbers, ties falling to the id, returned, unreturned
// and never-returned loans, two loans open at once including on the same day, due dates on and
// before today, sets never lent and loans for unknown sets), the caller's sets and loans left in
// their order and unchanged, the frozen timing script under target with the same work, and the
// work committed on the branch.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { catalogue } = await import(pathToFileURL(join(dir, 'src/catalogue.mjs')).href)

function composerOf(piece) {
  const name = (piece.composer ?? '').trim()
  return name === '' ? 'Trad.' : name
}
function byCatalogue(a, b) {
  const options = { sensitivity: 'base', numeric: true }
  return (
    composerOf(a).localeCompare(composerOf(b), 'en', options) ||
    a.title.localeCompare(b.title, 'en', options) ||
    (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  )
}
function statusOf(piece, loans, today) {
  const mine = loans.filter((loan) => loan.piece === piece.id)
  let current = null
  let lastLent = null
  for (const loan of mine) {
    if (lastLent === null || loan.out > lastLent) lastLent = loan.out
    if (loan.returned == null && (current === null || loan.out >= current.out)) current = loan
  }
  if (current === null)
    return { status: 'in', borrower: null, due: null, timesLent: mine.length, lastLent }
  return {
    status: current.due < today ? 'overdue' : 'out',
    borrower: current.borrower,
    due: current.due,
    timesLent: mine.length,
    lastLent,
  }
}
function reference(pieces, loans, today) {
  return [...pieces].sort(byCatalogue).map((piece) => ({
    id: piece.id,
    title: piece.title,
    composer: composerOf(piece),
    ...statusOf(piece, loans, today),
  }))
}

let seed = 2718
const next = () => (seed = (seed * 48271) % 2147483647)
const pick = (list) => list[next() % list.length]
const COMPOSERS = [
  'Dvořák, Antonín',
  'Dvorak, Antonin',
  'dvorak, antonin',
  'DVOŘÁK, Antonín',
  'Fauré, Gabriel',
  'Faure, Gabriel',
  'Elgar, Edward',
  ' Elgar, Edward ',
  '',
  '   ',
  undefined,
  'Trad.',
  'trad.',
  'Ærne, Ola',
]
const TITLES = [
  'Symphony No. 2',
  'Symphony No. 10',
  'symphony no. 2',
  'Symphony No. 02',
  'Suite 1a',
  'Suite 1b',
  'Élégie',
  'Elegie',
  'elegie',
  'Requiem',
]
const DAYS = ['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2025-12-31']
for (let round = 0; round < 400; round++) {
  const pieces = Array.from({ length: next() % 14 }, (_, i) => {
    const piece = { id: `S${pick([1, 2, 10, 3])}-${i}`, title: pick(TITLES), parts: 4 }
    const composer = pick(COMPOSERS)
    if (composer !== undefined) piece.composer = composer
    return piece
  })
  const ids = pieces.map((piece) => piece.id).concat(['S404', 'S9'])
  const loans = Array.from({ length: next() % 20 }, () => {
    const loan = {
      piece: pick(ids),
      borrower: pick(['Wells', 'Frome', 'Yeovil']),
      out: pick(DAYS),
      due: pick(DAYS),
    }
    const returned = next() % 4
    if (returned === 1) loan.returned = null
    else if (returned > 1) loan.returned = pick(DAYS)
    return loan
  })
  const today = pick(DAYS)
  const frozen = JSON.stringify({ pieces, loans })
  assert.deepEqual(
    catalogue(pieces, loans, today),
    reference(pieces, loans, today),
    `round ${round} on ${today}: ${frozen}`,
  )
  assert.equal(
    JSON.stringify({ pieces, loans }),
    frozen,
    "the caller's sets and loans are not changed",
  )
}

assert.equal(
  execFileSync(process.execPath, ['bin/catalogue.mjs'], { cwd: dir, encoding: 'utf8' }),
  [
    'S2210   Dvořák, Antonín    Symphony No. 9    1x  overdue (Taunton Sinfonia, due 2026-09-01)',
    'S2209   Dvorak, Antonin    Symphony No. 10   0x  in',
    'S1040   Elgar, Edward      Serenade          2x  out (Frome Choral, due 2026-12-01)',
    'S5000   Fauré, Gabriel     Requiem           2x  overdue (Wells Orchestra, due 2026-10-20)',
    "S1777   Holst, Gustav      St Paul's Suite   1x  in",
    'S1776   Trad.              Greensleeves      0x  in',
    'S3001   Trad.              Greensleeves      0x  in',
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
assert.equal(perf.work, 2600, 'every set')
assert.equal(perf.loans, 9000, 'every loan')
assert.equal(perf.out, 727, 'the same sets out')
assert.equal(perf.overdue, 700, 'the same sets overdue')
assert.deepEqual(perf.first, ['S46990-1915', 'S90348-225', 'S14142-2221'], 'the same order')
// Target is 10 ms; allow slack for a loaded machine.
assert.ok(perf.medianMs < 20, `median ${perf.medianMs} ms is far above the 10 ms target`)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })

const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$').split('\n').at(-1)
assert.equal(git('rev-parse', 'main'), baseline, 'main is untouched')
assert.ok(git('rev-list', `${baseline}..HEAD`, '--', '.'), 'the speed-up is committed')
assert.equal(git('status', '--porcelain', '--', 'src'), '', 'no uncommitted source changes')
