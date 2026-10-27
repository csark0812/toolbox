import assert from 'node:assert/strict'
import { test } from 'node:test'
import { pounds } from '../src/money.mjs'
import { unitLine } from '../src/units.mjs'

const unit = { id: 'A1', tenant: 'Jo Marsh', rent: 4500, dueDay: 31, firstUnpaid: '2026-08-31' }

test('a unit shows its tenant, rent, due day and what is owed', () => {
  assert.equal(
    unitLine(unit),
    'A1  Jo Marsh    £45.00/month, due on the 31st  owes from 2026-08-31',
  )
})

test('a paid-up unit says so', () => {
  assert.match(unitLine({ ...unit, dueDay: 12, firstUnpaid: null }), /due on the 12th {2}paid up$/)
})

test('pence are shown as pounds', () => {
  assert.equal(pounds(5), '£0.05')
  assert.equal(pounds(131500), '£1315.00')
})
