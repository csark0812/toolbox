import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ageOn, allocate, seatsUsed, walkLimit } from '../src/passes.mjs'

test('age is taken on the first day of the school year', () => {
  assert.equal(ageOn('2019-03-10', '2026-09-01'), 7)
  assert.equal(ageOn('2015-01-02', '2026-09-01'), 11)
})

test('under-eights walk up to 2 miles, everyone else up to 3', () => {
  assert.equal(walkLimit(5), 2)
  assert.equal(walkLimit(8), 3)
  assert.equal(walkLimit(11), 3)
})

test('pupils who qualify get a pass until the bus is full', () => {
  const pupils = [
    { id: 'X1', name: 'A', dob: '2016-01-01', route: 'A', miles: 4 },
    { id: 'X2', name: 'B', dob: '2016-01-01', route: 'A', miles: 5 },
    { id: 'X3', name: 'C', dob: '2016-01-01', route: 'A', miles: 6 },
  ]
  const outcomes = allocate(pupils, { A: { seats: 2 } })
  assert.deepEqual(
    outcomes.map(({ pass, reason }) => (pass ? 'pass' : reason)),
    ['pass', 'pass', 'route A full'],
  )
  assert.deepEqual(seatsUsed(outcomes), { A: 2 })
})

test('a pupil within walking distance gets no pass', () => {
  const pupils = [{ id: 'X1', name: 'A', dob: '2015-01-01', route: 'A', miles: 2.5 }]
  assert.equal(allocate(pupils, { A: { seats: 2 } })[0].reason, 'walking distance')
})
