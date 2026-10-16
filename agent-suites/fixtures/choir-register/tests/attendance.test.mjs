import assert from 'node:assert/strict'
import { test } from 'node:test'
import { attendance, formatRow } from '../src/attendance.mjs'

const members = [
  { name: 'Zoe', section: 'Alto', joined: '2020-01-01' },
  { name: 'Al', section: 'Bass', joined: '2020-01-01' },
]
const rehearsals = [
  { date: '2026-09-03', present: ['Zoe', 'Al'] },
  { date: '2026-09-10', present: ['Zoe'] },
]

test('counts rehearsals attended', () => {
  const rows = attendance(members, rehearsals)
  assert.deepEqual(
    rows.map((row) => [row.name, row.attended, row.possible, row.percent]),
    [
      ['Al', 1, 2, 50],
      ['Zoe', 2, 2, 100],
    ],
  )
})

test('formats a row', () => {
  assert.equal(
    formatRow({ name: 'Zoe', section: 'Alto', attended: 2, possible: 2, percent: 100 }),
    'Zoe           Alto       2/2  100%',
  )
})
