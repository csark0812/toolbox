import assert from 'node:assert/strict'
import { test } from 'node:test'
import { leaderboard } from '../src/board.mjs'

const books = [
  { isbn: '978-0-14-031753-6', title: 'Danny', pages: 208 },
  { isbn: '9781406317851', title: 'Gruffalo', pages: 32 },
]
const log = (child, isbn, at) => ({ child, isbn, at })

test('a book counts once per child however its ISBN is typed', () => {
  const [row] = leaderboard(
    [
      log('Amy', '9780140317536', '2026-07-20T10:00'),
      log('Amy ', '978-0-14-031753-6', '2026-07-21T10:00'),
    ],
    books,
  )
  assert.deepEqual(row, {
    child: 'Amy',
    books: 1,
    pages: 208,
    last: '2026-07-20T10:00',
    medal: null,
  })
})

test('logs outside the challenge do not count', () => {
  const rows = leaderboard(
    [
      log('Amy', '9780140317536', '2026-07-17T10:00'),
      log('Ben', '9781406317851', '2026-08-31T18:00'),
    ],
    books,
  )
  assert.deepEqual(
    rows.map((row) => row.child),
    ['Ben'],
  )
})

test('more pages wins a tie on books', () => {
  const rows = leaderboard(
    [
      log('Ben', '9781406317851', '2026-07-20T10:00'),
      log('Amy', '9780140317536', '2026-07-22T10:00'),
    ],
    books,
  )
  assert.deepEqual(
    rows.map((row) => row.child),
    ['Amy', 'Ben'],
  )
})
