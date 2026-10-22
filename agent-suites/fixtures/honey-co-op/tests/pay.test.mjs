import assert from 'node:assert/strict'
import { test } from 'node:test'
import { deliveryPence, priceFor, statement } from '../src/pay.mjs'

test('August honey is paid at the old price and later honey at the new one', () => {
  assert.equal(priceFor('2026-08-14'), 750)
  assert.equal(priceFor('2026-09-20'), 820)
})

test('a delivery is paid by weight, to the nearest penny', () => {
  assert.equal(deliveryPence({ member: 'A', date: '2026-08-10', kg: 10, scale: 'store' }), 7500)
  assert.equal(deliveryPence({ member: 'A', date: '2026-09-10', kg: 2.25, scale: 'store' }), 1845)
})

test('a statement adds up each member for the month only', () => {
  const rows = statement(
    [
      { member: 'A', date: '2026-09-02', kg: 2, scale: 'store' },
      { member: 'B', date: '2026-09-03', kg: 1, scale: 'store' },
      { member: 'A', date: '2026-09-09', kg: 3, scale: 'store' },
      { member: 'A', date: '2026-10-01', kg: 5, scale: 'store' },
    ],
    '2026-09',
  )
  assert.deepEqual(rows, [
    { member: 'A', kg: 5, pence: 4100 },
    { member: 'B', kg: 1, pence: 820 },
  ])
})
