import assert from 'node:assert/strict'
import { test } from 'node:test'
import { search } from '../src/search.mjs'
const products = [
  { id: 1, name: 'Blue Oak Lamp' },
  { id: 2, name: 'blue lamp' },
  { id: 3, name: 'Red Chair' },
]
test('matches every word case-insensitively, shortest name first', () => {
  assert.deepEqual(search(products, 'lamp BLUE'), [2, 1])
})
test('matches word prefixes and parts', () => {
  assert.deepEqual(search(products, 'cha'), [3])
})
