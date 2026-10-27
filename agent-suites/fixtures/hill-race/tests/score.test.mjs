import assert from 'node:assert/strict'
import { test } from 'node:test'
import { score } from '../src/score.mjs'

test('a missed checkpoint adds ten minutes', () => {
  const row = score('10:00:00', { name: 'Al', age: 30, finish: '10:50:00', missed: [2] })
  assert.equal(row.penalty, 600)
  assert.equal(row.adjusted, 3600)
})

test('runners over 60 get six minutes off', () => {
  const row = score('10:00:00', { name: 'Bea', age: 64, finish: '11:00:00', missed: [] })
  assert.equal(row.adjusted, 3600 - 360)
})
