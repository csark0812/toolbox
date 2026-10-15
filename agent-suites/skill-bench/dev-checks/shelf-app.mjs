// Development check for the shelf TODO batch: all three items fixed.
import assert from 'node:assert/strict'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { createShelf } = await import(pathToFileURL(join(dir, 'src/shelf.mjs')).href)
const { countBadge } = await import(pathToFileURL(join(dir, 'src/badge.mjs')).href)
const shelf = createShelf()
for (const title of ['Zebra', 'apple', 'Mango']) shelf.addBook(title)
assert.deepEqual(
  shelf.byTitle().map((book) => book.title),
  ['apple', 'Mango', 'Zebra'],
  'title sort ignores case',
)
assert.equal(countBadge(1), '1 book')
assert.equal(countBadge(2), '2 books')
assert.equal(countBadge(0), '0 books')
assert.equal(shelf.removeBook(999), false, 'missing id returns false')
assert.equal(shelf.removeBook(1), true)
