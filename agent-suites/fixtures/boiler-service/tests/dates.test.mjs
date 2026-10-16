import assert from 'node:assert/strict'
import { test } from 'node:test'
import { daysBetween, formatDay } from '../src/report/dates.mjs'
import { aYearAfter, fmtDate } from '../src/util.mjs'

test('formats a calendar date', () => {
  assert.equal(fmtDate('2026-11-04'), 'Wed 4 Nov 2026')
  assert.equal(formatDay('2026-11-04'), 'Wed 4 Nov 2026')
})

test('formats a Date at UTC midnight', () => {
  assert.equal(formatDay(new Date('2026-12-25T00:00:00Z')), 'Fri 25 Dec 2026')
})

test('refuses a non-date', () => {
  assert.throws(() => formatDay('soon'), RangeError)
})

test('a year later, with leap days', () => {
  assert.equal(aYearAfter('2025-11-04'), '2026-11-04')
  assert.equal(aYearAfter('2028-02-29'), '2029-02-28')
})

test('days between dates', () => {
  assert.equal(daysBetween('2026-11-04', '2026-11-27'), 23)
})
