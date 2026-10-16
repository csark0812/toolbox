import assert from 'node:assert/strict'
import { test } from 'node:test'
import { firstRound, seedOrder } from '../src/bracket.mjs'

test('orders seeds so 1 and 2 meet last', () => {
  assert.deepEqual(seedOrder(4), [1, 4, 2, 3])
  assert.deepEqual(seedOrder(8), [1, 8, 4, 5, 2, 7, 3, 6])
})

test('draws a full bracket', () => {
  assert.deepEqual(firstRound(['a', 'b', 'c', 'd']), [
    ['a', 'd'],
    ['b', 'c'],
  ])
})

test('needs two players', () => {
  assert.throws(() => firstRound(['a']), RangeError)
})
