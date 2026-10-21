import assert from 'node:assert/strict'
import { test } from 'node:test'
import { priceGrooms } from '../src/prices.mjs'

const groom = (date, dog, size = 'small', extras = []) => ({
  date,
  owner: 'Test',
  dog,
  size,
  extras,
})

test('a groom is priced by size plus extras', () => {
  const [medium, large] = priceGrooms([
    groom('2026-07-01', 'A', 'medium', ['nails', 'teeth']),
    groom('2026-07-02', 'B', 'large'),
  ])
  assert.equal(medium.price, 49)
  assert.equal(large.price, 46)
})

test('the sixth groom for a dog is free', () => {
  const dates = ['07-01', '07-20', '08-10', '09-01', '09-20', '10-10', '10-30']
  const priced = priceGrooms(dates.map((d) => groom(`2026-${d}`, 'Rex')))
  assert.deepEqual(
    priced.map(({ number, free }) => [number, free]),
    [
      [1, false],
      [2, false],
      [3, false],
      [4, false],
      [5, false],
      [6, true],
      [7, false],
    ],
  )
})
