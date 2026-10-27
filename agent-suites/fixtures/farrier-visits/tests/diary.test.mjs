import assert from 'node:assert/strict'
import { test } from 'node:test'
import { nextVisit, owed, round, workFor } from '../src/diary.mjs'

const horse = (fields) => ({
  name: 'Nell',
  owner: 'Sue',
  yard: "Hussain's Yard",
  lastVisit: '2026-09-01',
  ...fields,
})

test('the work follows what the horse wears', () => {
  assert.equal(workFor(horse({ shoes: 'all' })), 'all')
  assert.equal(workFor(horse({ shoes: 'front' })), 'front')
  assert.equal(workFor(horse({ shoes: 'none' })), 'trim')
  assert.equal(workFor(horse({})), 'trim')
})

test('a shod horse is seen six weeks on', () => {
  assert.deepEqual(nextVisit(horse({ shoes: 'all' })), {
    horse: 'Nell',
    yard: "Hussain's Yard",
    date: '2026-10-13',
    work: 'all',
    price: 9500,
  })
})

test('a youngster with no shoes field is on eight weeks', () => {
  assert.equal(nextVisit(horse({})).date, '2026-10-27')
})

test('the round runs in date order', () => {
  const visits = round([
    horse({ name: 'B', shoes: 'all', lastVisit: '2026-09-10' }),
    horse({ name: 'A', shoes: 'all' }),
  ])
  assert.deepEqual(
    visits.map((visit) => visit.horse),
    ['A', 'B'],
  )
})

test('only unpaid visits are owed', () => {
  const visits = [
    { horse: 'A', date: '2026-09-01', work: 'trim', paid: true },
    { horse: 'B', date: '2026-09-02', work: 'front', paid: false },
  ]
  assert.deepEqual(
    owed(visits).map((visit) => [visit.horse, visit.price]),
    [['B', 6500]],
  )
})
