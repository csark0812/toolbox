import assert from 'node:assert/strict'
import { test } from 'node:test'
import { normalizeRef, reconcile } from '../src/reconcile.mjs'

test('normalizes references', () => {
  assert.equal(normalizeRef('inv-0042'), 'INV42')
  assert.equal(normalizeRef('INV42'), 'INV42')
  assert.equal(normalizeRef('po 100'), 'PO100')
})

test('matches closest date and leaves the rest', () => {
  const entries = [
    { id: 1, ref: 'INV-0001', amountCents: 1000, date: '2026-09-01' },
    { id: 2, ref: 'INV-0001', amountCents: 1000, date: '2026-09-04' },
    { id: 3, ref: 'PO-0007', amountCents: 250, date: '2026-09-10' },
  ]
  const statement = [
    { line: 1, ref: 'inv 1', amount: '10.00', date: '2026-09-05' },
    { line: 2, ref: 'INV0001', amount: '10.00', date: '2026-09-02' },
    { line: 3, ref: 'PO7', amount: '2.50', date: '2026-09-20' },
  ]
  assert.deepEqual(reconcile(entries, statement), {
    matched: [
      [1, 2],
      [2, 1],
    ],
    unmatchedLines: [3],
    unmatchedEntries: [3],
  })
})
