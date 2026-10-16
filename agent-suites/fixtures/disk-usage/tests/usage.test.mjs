import assert from 'node:assert/strict'
import { test } from 'node:test'
import { entriesIn } from '../src/usage.mjs'

const files = [
  { path: 'a/x.txt', size: 10 },
  { path: 'a/b/y.txt', size: 5 },
  { path: 'c.txt', size: 12 },
]

test('totals each top-level entry', () => {
  assert.deepEqual(entriesIn(files), [
    { name: 'a/', bytes: 15 },
    { name: 'c.txt', bytes: 12 },
  ])
})

test('lists inside a folder', () => {
  assert.deepEqual(entriesIn(files, 'a'), [
    { name: 'x.txt', bytes: 10 },
    { name: 'b/', bytes: 5 },
  ])
})
