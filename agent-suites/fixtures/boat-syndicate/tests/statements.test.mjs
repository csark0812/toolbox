import assert from 'node:assert/strict'
import { test } from 'node:test'
import { apportion, statements } from '../src/statements.mjs'

test('apportion gives leftover pennies to the largest remainders, earlier first', () => {
  assert.deepEqual(apportion(100, [1, 1, 1]), [34, 33, 33])
  assert.deepEqual(apportion(1000, [2, 1, 1, 1]), [400, 200, 200, 200])
  assert.deepEqual(apportion(-100, [1, 1, 1]), [-33, -33, -34])
})

const members = [
  { id: 'ros', name: 'Ros', share: 2 },
  { id: 'tam', name: 'Tam' },
]

test('fuel goes by hours in the period, to the nearest six minutes', () => {
  const [ros, tam] = statements(
    members,
    [
      { member: 'ros', date: '2026-06-01', hours: 1.15 },
      { member: 'tam', date: '2026-06-30', hours: 1.25 },
      { member: 'tam', date: '2026-07-01', hours: 9 },
      { member: 'guest', date: '2026-06-10', hours: 9 },
    ],
    [{ id: 'fuel', from: '2026-06-01', to: '2026-06-30', pence: 2400, basis: 'hours' }],
  )
  assert.deepEqual([ros.total, tam.total], [1152, 1248])
})

test('a period with no trips falls back to shares, and leavers stop paying', () => {
  const [ros, tam] = statements(
    [members[0], { ...members[1], left: '2026-05-31' }],
    [],
    [
      { id: 'fuel', from: '2026-06-01', to: '2026-06-30', pence: 900, basis: 'hours' },
      { id: 'insurance', from: '2026-06-01', to: '2026-06-30', pence: 500, basis: 'equal' },
    ],
  )
  assert.deepEqual(ros.lines, [
    { cost: 'fuel', pence: 900 },
    { cost: 'insurance', pence: 500 },
  ])
  assert.equal(tam.total, 0)
})

test('statements follow trips logged since the last call', () => {
  const trips = [{ member: 'ros', date: '2026-06-02', hours: 2 }]
  const costs = [{ id: 'fuel', from: '2026-06-01', to: '2026-06-30', pence: 1000, basis: 'hours' }]
  assert.equal(statements(members, trips, costs)[1].total, 0)
  trips.push({ member: 'tam', date: '2026-06-03', hours: 2 })
  assert.equal(statements(members, trips, costs)[1].total, 500)
})
