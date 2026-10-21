import assert from 'node:assert/strict'
import { test } from 'node:test'
import { spanMinutes } from '../src/clock.mjs'
import { monthReport } from '../src/fog.mjs'

test('a period past midnight counts to the next morning', () => {
  assert.equal(spanMinutes('22:00', '01:30'), 210)
})

test('the month adds up each day', () => {
  const report = monthReport(
    [
      { date: '2026-10-07', start: '19:15', end: '21:45', keeper: 'Bob' },
      { date: '2026-10-30', start: '10:00', end: '10:45', keeper: 'Bob' },
    ],
    '2026-10',
  )
  assert.equal(report.total, 195)
})
