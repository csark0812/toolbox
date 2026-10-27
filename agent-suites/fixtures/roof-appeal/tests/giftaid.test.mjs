import assert from 'node:assert/strict'
import { test } from 'node:test'
import { covered, inQuarter, parseDonations, parseDonors, quarterClaim } from '../src/giftaid.mjs'

const donors = parseDonors(`donorId,name,declared,cancelled
D-001,Mrs A Test,2020-01-15,
D-002,Mr B Test,,`)

test('a gift after the declaration is covered', () => {
  assert.equal(covered({ date: '2026-07-04', source: 'envelope' }, donors.get('D-001')), true)
})

test('a donor with no declaration is not covered', () => {
  assert.equal(covered({ date: '2026-07-04', source: 'envelope' }, donors.get('D-002')), false)
})

test('raffle tickets and anonymous gifts never qualify', () => {
  assert.equal(covered({ date: '2026-07-04', source: 'raffle' }, donors.get('D-001')), false)
  assert.equal(covered({ date: '2026-07-04', source: 'envelope' }, undefined), false)
})

test('quarters are calendar quarters', () => {
  assert.equal(inQuarter('2026-07-01', '2026-Q3'), true)
  assert.equal(inQuarter('2026-09-30', '2026-Q3'), true)
  assert.equal(inQuarter('2026-10-01', '2026-Q3'), false)
  assert.equal(inQuarter('2025-08-01', '2026-Q3'), false)
})

test('the claim is a quarter of the covered gifts', () => {
  const gifts = parseDonations(`date,donorId,amount,source
2026-07-04,D-001,10.00,envelope
2026-08-09,D-001,30.00,online
2026-08-09,D-002,50.00,envelope
2026-10-02,D-001,20.00,envelope`)
  const claim = quarterClaim(gifts, donors, '2026-Q3')
  assert.equal(claim.gifts.length, 2)
  assert.equal(claim.total, 40)
  assert.equal(claim.giftAid, 10)
})
