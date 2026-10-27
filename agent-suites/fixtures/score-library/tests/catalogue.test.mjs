import assert from 'node:assert/strict'
import { test } from 'node:test'
import { catalogue } from '../src/catalogue.mjs'

test('catalogue order ignores case and accents and reads numbers as numbers', () => {
  const rows = catalogue(
    [
      { id: 'b', composer: 'Dvořák, Antonín', title: 'Symphony No. 10' },
      { id: 'a', composer: 'dvorak, antonin', title: 'Symphony No. 2' },
      { id: 'c', title: 'Ash Grove' },
      { id: 'd', composer: 'Bach, J. S.', title: 'Suite' },
    ],
    [],
    '2026-10-21',
  )
  assert.deepEqual(
    rows.map((row) => row.id),
    ['d', 'a', 'b', 'c'],
  )
  assert.equal(rows[3].composer, 'Trad.')
})

test('open loans decide where a set is', () => {
  const loans = [
    { piece: 'x', borrower: 'A', out: '2026-01-01', due: '2026-02-01', returned: '2026-02-01' },
    { piece: 'x', borrower: 'B', out: '2026-09-01', due: '2026-10-20', returned: null },
    { piece: 'y', borrower: 'C', out: '2026-09-01', due: '2026-10-21' },
  ]
  const [x, y] = catalogue(
    [
      { id: 'x', composer: 'Holst, Gustav', title: 'A' },
      { id: 'y', composer: 'Holst, Gustav', title: 'B' },
    ],
    loans,
    '2026-10-21',
  )
  assert.deepEqual(x, {
    id: 'x',
    title: 'A',
    composer: 'Holst, Gustav',
    status: 'overdue',
    borrower: 'B',
    due: '2026-10-20',
    timesLent: 2,
    lastLent: '2026-09-01',
  })
  assert.equal(y.status, 'out')
})
