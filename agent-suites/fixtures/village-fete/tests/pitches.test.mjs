import assert from 'node:assert/strict'
import { test } from 'node:test'
import { longDate, pitchFees } from '../src/pitches.mjs'

test('a charity pays half for a small pitch', () => {
  const [row] = pitchFees([{ stall: 'Cakes', size: 'small', charity: true }])
  assert.equal(row.pence, 750)
  assert.equal(row.metres, 3)
})

test('a cancelled stall owes nothing and is left off', () => {
  assert.deepEqual(
    pitchFees([{ stall: 'Crafts', size: 'large', charity: false, cancelled: true }]),
    [],
  )
})

test('the date is written out in full', () => {
  assert.equal(longDate('2026-07-04'), 'Saturday 4 July 2026')
})
