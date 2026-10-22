import assert from 'node:assert/strict'
import { test } from 'node:test'
import { dayTotals } from '../src/day.mjs'
import { fairTotals } from '../src/fair.mjs'

const rows = [
  { day: '1', breed: 'Jacob', exhibitor: 'A', kg: '3' },
  { day: '1', breed: 'Jacob', exhibitor: 'B', kg: '2' },
  { day: '2', breed: 'Herdwick', exhibitor: 'C', kg: '2.5' },
]

test('day totals cover one day only', () => {
  assert.deepEqual(dayTotals(rows, 1), [{ breed: 'Jacob', fleeces: 2, kg: 5, mean: 2.5 }])
})

test('fair totals cover every day, breeds in name order', () => {
  assert.deepEqual(
    fairTotals(rows).map((t) => [t.breed, t.fleeces]),
    [
      ['Herdwick', 1],
      ['Jacob', 2],
    ],
  )
})
