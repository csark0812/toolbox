import assert from 'node:assert/strict'
import { test } from 'node:test'
import { outstanding } from '../src/slips.mjs'

const roster = [
  { id: 'a', name: 'Zed', form: '5B', allergies: [] },
  { id: 'b', name: 'Amy', form: '5B', allergies: [] },
  { id: 'c', name: 'Bo', form: '5A', allergies: [] },
]

test('lists missing slips by form then name', () => {
  assert.deepEqual(
    outstanding(roster, { zoo: ['c'] }, 'zoo').map((s) => s.name),
    ['Amy', 'Zed'],
  )
})

test('an unknown trip is an error', () => {
  assert.throws(() => outstanding(roster, {}, 'moon'), RangeError)
})
