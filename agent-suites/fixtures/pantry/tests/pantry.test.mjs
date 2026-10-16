import assert from 'node:assert/strict'
import { test } from 'node:test'
import { freshness, parseQuantity, totals } from '../src/pantry.mjs'

const item = (expires) => ({ name: 'x', quantity: '1 kg', expires })

test('parses quantities', () => {
  assert.deepEqual(parseQuantity('400 g'), { amount: 400, unit: 'g' })
  assert.deepEqual(parseQuantity('6 eggs'), { amount: 6, unit: 'eggs' })
  assert.throws(() => parseQuantity('some'), RangeError)
})

test('freshness', () => {
  assert.equal(freshness(item('2026-10-10'), '2026-10-16'), 'expired')
  assert.equal(freshness(item('2026-10-18'), '2026-10-16'), 'soon')
  assert.equal(freshness(item('2026-11-30'), '2026-10-16'), 'fine')
})

test('totals per unit', () => {
  assert.deepEqual(totals([{ quantity: '400 g' }, { quantity: '350 g' }, { quantity: '6 eggs' }]), [
    '6 eggs',
    '750 g',
  ])
})
