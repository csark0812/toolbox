import assert from 'node:assert/strict'
import { test } from 'node:test'
import { invoices, lessonCharge } from '../src/invoice.mjs'

const lesson = (minutes, family = 'A', date = '2026-10-01') => ({
  student: 's',
  family,
  date,
  minutes,
})

test('an hour costs the hourly rate', () => {
  assert.equal(lessonCharge(lesson(60)), 3600)
})

test('invoices group lessons by family for the month', () => {
  const result = invoices(
    [lesson(60, 'B'), lesson(60, 'A'), lesson(60, 'A', '2026-11-01')],
    '2026-10',
  )
  assert.deepEqual(
    result.map((f) => [f.family, f.total]),
    [
      ['A', 3600],
      ['B', 3600],
    ],
  )
})
