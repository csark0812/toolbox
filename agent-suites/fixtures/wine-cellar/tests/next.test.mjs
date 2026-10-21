import assert from 'node:assert/strict'
import { test } from 'node:test'
import { drinkNext } from '../src/next.mjs'

const bottle = (id, producer, vintage, score, opens, closes) => ({
  id,
  producer,
  wine: 'Rouge',
  vintage,
  score,
  opens,
  closes,
})

test('only open windows are listed, soonest to close first', () => {
  const list = drinkNext(
    [
      bottle('A', 'Ch. Musar', 2012, 90, '2020-01-01', '2028-01-01'),
      bottle('B', 'Ridge', 2014, 90, '2020-01-01', '2027-01-01'),
      bottle('C', 'Ridge', 2014, 90, '2027-01-01', '2030-01-01'),
    ],
    '2026-11-01',
  )
  assert.deepEqual(
    list.map((entry) => entry.id),
    ['B', 'A'],
  )
})

test('rank counts the same producer and vintage however the name is typed', () => {
  const list = drinkNext(
    [
      bottle('A', 'Ch. Musar', 2012, 90, '2020-01-01', '2028-01-01'),
      bottle('B', ' CH. MUSAR', 2012, 94, '2027-01-01', '2030-01-01'),
    ],
    '2026-11-01',
  )
  assert.equal(list[0].rank, 2)
})

test('both ends of the window are open days', () => {
  const list = drinkNext([bottle('A', 'Ridge', 2014, 90, '2026-11-01', '2026-11-01')], '2026-11-01')
  assert.deepEqual(list[0].daysLeft, 0)
})
