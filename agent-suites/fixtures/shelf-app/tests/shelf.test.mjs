import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createShelf } from '../src/shelf.mjs'
import { countBadge } from '../src/badge.mjs'

test('adds and removes books', () => {
  const shelf = createShelf()
  const book = shelf.addBook('Dune')
  assert.equal(shelf.removeBook(book.id), true)
  assert.equal(shelf.count(), 0)
})

test('sorts by title', () => {
  const shelf = createShelf()
  for (const title of ['Emma', 'Dune', 'Beloved']) shelf.addBook(title)
  assert.deepEqual(
    shelf.byTitle().map((book) => book.title),
    ['Beloved', 'Dune', 'Emma'],
  )
})

test('badge shows the count', () => {
  assert.equal(countBadge(3), '3 books')
})
