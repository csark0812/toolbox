import assert from 'node:assert/strict'
import { test } from 'node:test'
import { allocate } from '../src/allocate.mjs'
import { formatCents, toCents } from '../src/money.mjs'
import { billTotal, splitBill } from '../src/split.mjs'

test('parses and formats cents', () => {
  assert.equal(toCents('12.5'), 1250)
  assert.equal(toCents('$1,204.07'), 120407)
  assert.equal(formatCents(5), '$0.05')
  assert.throws(() => toCents('12.345'), RangeError)
})

test('splits evenly when it divides', () => {
  assert.deepEqual(allocate(900, [1, 1, 1]), [300, 300, 300])
  assert.deepEqual(allocate(1000, [1, 3]), [250, 750])
})

test('hands the leftover cent to the first person', () => {
  assert.deepEqual(allocate(1000, [1, 1, 1]), [334, 333, 333])
})

test('shares the tip by what each person ordered', () => {
  const bill = {
    people: ['ana', 'ben'],
    items: [
      { name: 'Soup', price: '6.00', people: ['ana'] },
      { name: 'Steak', price: '24.00', people: ['ben'] },
    ],
    tipPercent: 10,
  }
  assert.deepEqual(splitBill(bill), [
    { person: 'ana', cents: 660 },
    { person: 'ben', cents: 2640 },
  ])
  assert.equal(billTotal(bill), 3300)
})
