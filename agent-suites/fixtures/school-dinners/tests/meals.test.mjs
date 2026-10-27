import assert from 'node:assert/strict'
import { test } from 'node:test'
import { bill, kitchenSheet } from '../src/meals.mjs'

const pupils = [
  { id: 'A', name: 'Amy', class: '3B', lunch: 'school', freeMeals: false, allergies: [] },
  { id: 'B', name: 'Bo', class: '3B', lunch: 'packed', freeMeals: false, allergies: [] },
  { id: 'C', name: 'Cal', class: '4A', lunch: 'school', freeMeals: true, allergies: [] },
]

test('a day off is not charged', () => {
  const rows = bill(pupils, [{ pupil: 'A', date: '2026-10-02' }], ['2026-10-01', '2026-10-02'])
  assert.deepEqual(
    rows.map((row) => [row.name, row.dinners, row.pence]),
    [
      ['Amy', 1, 260],
      ['Cal', 2, 0],
    ],
  )
})

test('the kitchen counts pupils who are in', () => {
  assert.deepEqual(kitchenSheet(pupils, [{ pupil: 'B', date: '2026-10-01' }], '2026-10-01'), {
    dinners: 2,
    packed: 0,
  })
})
