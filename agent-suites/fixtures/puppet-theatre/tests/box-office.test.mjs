import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  adultPrice,
  book,
  childPrice,
  concessionPrice,
  priceFor,
  roundPence,
  setSeason,
} from '../src/box-office.mjs'

test('prices by band', () => {
  setSeason('standard')
  assert.equal(adultPrice('A1'), 1450)
  assert.equal(childPrice('C2'), 720)
  assert.equal(concessionPrice('F6'), 650)
})

test('concessions never go below five pounds', () => {
  setSeason('schools')
  assert.equal(concessionPrice('E1'), 500)
  setSeason('standard')
})

test('rounding is to the nearest 5p', () => {
  assert.equal(roundPence(1442), 1440)
  assert.equal(roundPence(1443), 1445)
})

test('panto season costs more', () => {
  setSeason('panto')
  assert.equal(priceFor('A1', 'adult'), 1740)
  setSeason('standard')
})

test('a taken seat cannot be booked', () => {
  const bookings = [{ show: 'Sat 11:00', seat: 'A1', type: 'adult', pence: 1450 }]
  assert.throws(() => book(bookings, 'Sat 11:00', 'A1', 'adult'), /already booked/)
  assert.deepEqual(book(bookings, 'Sat 14:00', 'A1', 'child'), {
    show: 'Sat 14:00',
    seat: 'A1',
    type: 'child',
    pence: 870,
  })
})
