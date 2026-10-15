// Hidden acceptance for the search task: same results on random catalogs and queries, harness untouched.
import assert from 'node:assert/strict'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { search } = await import(pathToFileURL(join(dir, 'src/search.mjs')).href)
const reference = (products, query) => {
  const words = query.toLowerCase().split(' ').filter(Boolean)
  return products
    .filter((p) =>
      words.every((w) =>
        p.name
          .toLowerCase()
          .split(' ')
          .some((part) => part.includes(w)),
      ),
    )
    .sort((a, b) => a.name.length - b.name.length || a.id - b.id)
    .map((p) => p.id)
}
const words = ['Ax', 'bx', 'cxd', 'D', 'ee', 'fA']
let seed = 3
const next = () => (seed = (seed * 48271) % 2147483647)
for (let round = 0; round < 40; round++) {
  const products = Array.from({ length: 60 }, (_, id) => ({
    id,
    name: Array.from({ length: 1 + (next() % 4) }, () => words[next() % words.length]).join(' '),
  }))
  const query = Array.from({ length: 1 + (next() % 3) }, () =>
    words[next() % words.length].slice(0, 1 + (next() % 2)),
  ).join(' ')
  assert.deepEqual(search(products, query), reference(products, query), `query "${query}"`)
}
assert.deepEqual(search([{ id: 1, name: 'a' }], '  '), [1], 'an empty query matches everything')
