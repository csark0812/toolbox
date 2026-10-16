import assert from 'node:assert/strict'
import { test } from 'node:test'
import { dueList, status } from '../src/reminders.mjs'

test('flags overdue vaccinations', () => {
  assert.deepEqual(status('2026-10-01', '2026-10-15'), {
    kind: 'overdue',
    label: 'OVERDUE by 14 days',
  })
})

test('flags vaccinations due soon', () => {
  assert.deepEqual(status('2026-10-20', '2026-10-15'), { kind: 'soon', label: 'due in 5 days' })
  assert.equal(status('2026-12-20', '2026-10-15'), null)
})

test('sorts by due date', () => {
  const pets = [
    { name: 'B', species: 'cat', owner: 'x', vaccines: [{ name: 'v', due: '2026-10-18' }] },
    { name: 'A', species: 'dog', owner: 'y', vaccines: [{ name: 'v', due: '2026-10-16' }] },
  ]
  assert.deepEqual(
    dueList(pets, '2026-10-15').map((row) => row.pet),
    ['A', 'B'],
  )
})
