import assert from 'node:assert/strict'
import { test } from 'node:test'
import { dueDate, dueIn } from '../src/recall.mjs'

test('a patient is due back on the same day, months later', () => {
  assert.equal(dueDate('2026-05-12', 6), '2026-11-12')
  assert.equal(dueDate('2025-11-30', 12), '2026-11-30')
})

test('patients who have left are not recalled', () => {
  const patients = [
    { name: 'Ann', lastSeen: '2026-05-10', months: 6, left: false },
    { name: 'Bob', lastSeen: '2026-05-09', months: 6, left: true },
  ]
  assert.deepEqual(
    dueIn(patients, '2026-11').map((p) => p.name),
    ['Ann'],
  )
})
