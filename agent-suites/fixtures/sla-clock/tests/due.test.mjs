import assert from 'node:assert/strict'
import { test } from 'node:test'
import { dueDate } from '../src/due.mjs'

test('adds the priority days', () => {
  assert.equal(dueDate('2026-10-12', 'P2'), '2026-10-15')
})

test('rejects unknown priorities', () => {
  assert.throws(() => dueDate('2026-10-12', 'P9'), RangeError)
})
