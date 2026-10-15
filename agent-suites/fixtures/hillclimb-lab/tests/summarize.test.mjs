import assert from 'node:assert/strict'
import { test } from 'node:test'
import { summarize } from '../src/summarize.mjs'

const record = (id, ...points) => ({
  id,
  rounds: points.map((p) => ({ points: p, multiplier: 1 })),
})

test('keeps the first record per player and orders by score', () => {
  const result = summarize([record('b', 5), record('a', 9), record('b', 100), record('c', 1)])
  assert.deepEqual(result, [
    { id: 'a', score: 9 },
    { id: 'b', score: 5 },
    { id: 'c', score: 1 },
  ])
})

test('breaks score ties by id', () => {
  assert.deepEqual(
    summarize([record('z', 3), record('m', 3)]).map((entry) => entry.id),
    ['m', 'z'],
  )
})
