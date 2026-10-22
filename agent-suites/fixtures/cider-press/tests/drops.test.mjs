import assert from 'node:assert/strict'
import { test } from 'node:test'
import { dropLine } from '../src/drops.mjs'

test('a drop-off shows its id, date, grower, variety and the weight on the tag', () => {
  assert.equal(
    dropLine({
      id: 'D10',
      date: '2026-10-17',
      grower: 'Ann Lee',
      variety: 'Bramley',
      weight: '42 kg',
    }),
    'D10  2026-10-17  Ann Lee  Bramley  42 kg',
  )
})

test('stray spaces around a grower are not shown', () => {
  assert.match(
    dropLine({
      id: 'D13',
      date: '2026-10-17',
      grower: 'Bob Hart ',
      variety: 'Cox',
      weight: '3st 4lb',
    }),
    /Bob Hart {2}Cox/,
  )
})
