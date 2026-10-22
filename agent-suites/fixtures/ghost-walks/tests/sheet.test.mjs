import assert from 'node:assert/strict'
import { test } from 'node:test'
import { walkSheet } from '../src/sheet.mjs'

const walk = { id: 'W9', date: '2026-10-30', title: 'The Grey Lady', guide: 'Elin' }

test('a sheet starts with the date, the walk and the guide', () => {
  assert.equal(walkSheet(walk, [])[0], 'Fri 30 Oct  The Grey Lady  (guide: Elin)')
})

test('a sheet lists only that walk’s bookings', () => {
  const bookings = [
    { ref: 'B-1', walk: 'W9', name: 'Hughes', people: 4 },
    { ref: 'B-2', walk: 'W8', name: 'Patel', people: 2 },
  ]
  assert.deepEqual(walkSheet(walk, bookings).slice(1), ['  B-1  Hughes x4'])
})
