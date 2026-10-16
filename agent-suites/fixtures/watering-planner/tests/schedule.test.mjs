import assert from 'node:assert/strict'
import { test } from 'node:test'
import { occurrences, parseDate, plan } from '../src/schedule.mjs'

const window = (start, end) => [parseDate(start), parseDate(end)]

test('repeats a task every few days', () => {
  const task = { from: '2027-01-03', every: { count: 7, unit: 'day' } }
  assert.deepEqual(occurrences(task, ...window('2027-01-01', '2027-02-01')), [
    '2027-01-03',
    '2027-01-10',
    '2027-01-17',
    '2027-01-24',
    '2027-01-31',
  ])
})

test('repeats a task on the same day each month', () => {
  const task = { from: '2027-01-15', every: { count: 1, unit: 'month' } }
  assert.deepEqual(occurrences(task, ...window('2027-02-01', '2027-05-01')), [
    '2027-02-15',
    '2027-03-15',
    '2027-04-15',
  ])
})

test('sorts the plan by date, then plant', () => {
  const plants = [
    { name: 'b', tasks: [{ kind: 'water', from: '2027-01-02', every: { count: 2, unit: 'day' } }] },
    { name: 'a', tasks: [{ kind: 'water', from: '2027-01-02', every: { count: 3, unit: 'day' } }] },
  ]
  assert.deepEqual(
    plan(plants, '2027-01-02', 1)
      .slice(0, 3)
      .map((row) => `${row.date} ${row.plant}`),
    ['2027-01-02 a', '2027-01-02 b', '2027-01-04 b'],
  )
})

test('rejects a malformed date', () => {
  assert.throws(() => parseDate('2027-1-5'), RangeError)
})
