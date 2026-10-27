import assert from 'node:assert/strict'
import { test } from 'node:test'
import { positions } from '../src/attendance.mjs'
import { addMonths } from '../src/dates.mjs'

test('six months from the end of August is the end of February', () => {
  assert.equal(addMonths('2025-08-31', 6), '2026-02-28')
})

test('apologies are not attendance', () => {
  const [row] = positions(
    [
      { date: '2026-03-10', body: 'Full Council', councillor: 'A', status: 'present' },
      { date: '2026-05-12', body: 'Full Council', councillor: 'A', status: 'apologies' },
    ],
    '2026-08-01',
  )
  assert.deepEqual(row, {
    councillor: 'A',
    last: '2026-03-10',
    runsOut: '2026-09-10',
    flag: 'AT RISK',
  })
})

test('the six months running out today means the seat has lapsed', () => {
  const [row] = positions(
    [{ date: '2026-04-14', body: 'Full Council', councillor: 'B', status: 'present' }],
    '2026-10-14',
  )
  assert.equal(row.flag, 'LAPSED')
})
