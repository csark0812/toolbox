import assert from 'node:assert/strict'
import { test } from 'node:test'
import { clashes } from '../src/clashes.mjs'

const shift = (id, crew, start, end) => ({ id, crew, stage: 'Main', start, end })

test('overlapping shifts for one person clash', () => {
  assert.deepEqual(
    clashes([
      shift('A', 'Kim Ade', '2026-10-16T14:00', '2026-10-16T18:00'),
      shift('B', 'Kim Ade', '2026-10-16T17:00', '2026-10-16T20:00'),
    ]),
    [{ person: 'kim ade', first: 'A', second: 'B' }],
  )
})

test('touching shifts do not clash', () => {
  assert.deepEqual(
    clashes([
      shift('A', 'Kim Ade', '2026-10-16T14:00', '2026-10-16T18:00'),
      shift('B', 'Kim Ade', '2026-10-16T18:00', '2026-10-16T20:00'),
    ]),
    [],
  )
})

test('names match however they are typed', () => {
  assert.equal(
    clashes([
      shift('A', 'KIM ADE', '2026-10-16T14:00', '2026-10-16T18:00'),
      shift('B', ' kim ade', '2026-10-16T15:00', '2026-10-16T16:00'),
    ]).length,
    1,
  )
})

test('the earlier shift is named first', () => {
  assert.deepEqual(
    clashes([
      shift('B', 'Ola Berg', '2026-10-16T15:00', '2026-10-16T19:00'),
      shift('A', 'Ola Berg', '2026-10-16T13:00', '2026-10-16T16:00'),
    ]),
    [{ person: 'ola berg', first: 'A', second: 'B' }],
  )
})
