import assert from 'node:assert/strict'
import { test } from 'node:test'
import { addDays, longDate } from '../src/dates.mjs'
import { expiringIn, renewal } from '../src/permits.mjs'

test('a renewal starts the day after and runs a year', () => {
  assert.deepEqual(renewal({ ends: '2026-04-30' }), { starts: '2026-05-01', ends: '2027-04-30' })
})

test('a renewal across the end of a year', () => {
  assert.deepEqual(renewal({ ends: '2026-11-30' }), { starts: '2026-12-01', ends: '2027-11-30' })
})

test('days add across months', () => {
  assert.equal(addDays('2026-01-31', 1), '2026-02-01')
  assert.equal(longDate('2027-04-01'), '1 Apr 2027')
})

test('permits ending in a month', () => {
  assert.deepEqual(
    expiringIn([{ ends: '2027-04-14' }, { ends: '2027-05-01' }], '2027-04').map((p) => p.ends),
    ['2027-04-14'],
  )
})
