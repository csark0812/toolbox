import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fees, isFifthSaturday, parseAttendance } from '../src/fees.mjs'

test('the fifth Saturday of a month is free', () => {
  assert.equal(isFifthSaturday('2026-01-31'), true)
  assert.equal(isFifthSaturday('2026-05-30'), true)
})

test('an ordinary Saturday is not free', () => {
  assert.equal(isFifthSaturday('2026-03-21'), false)
})

test('only standard pitches pay on the day', () => {
  const csv = `date,trader,kind
2026-03-14,One,standard
2026-03-14,Two,season
2026-03-14,Three,charity
2026-01-31,One,standard`
  assert.equal(fees(parseAttendance(csv), '2026-03'), 22)
  assert.equal(fees(parseAttendance(csv), '2026-01'), 0)
})
