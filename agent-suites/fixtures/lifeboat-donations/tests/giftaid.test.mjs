import assert from 'node:assert/strict'
import { test } from 'node:test'
import { covers, giftAid } from '../src/giftaid.mjs'

const declarations = [{ surname: 'Jago', postcode: 'TR18 1AA', signed: '2025-05-01' }]
const donation = (date, amount, name = 'Ann Jago', postcode = 'TR18 1AA') => ({
  date,
  name,
  postcode,
  amount,
  method: 'card',
})

test('a donor with a declaration gets 25p on the pound', () => {
  assert.equal(giftAid(donation('2026-10-01', 40), declarations), 10)
})

test('no declaration, no Gift Aid', () => {
  assert.equal(giftAid(donation('2026-10-01', 40, 'Bob Hall', 'TR20 2BB'), declarations), 0)
})

test('a cancelled declaration stops covering donations on the day it was cancelled', () => {
  const cancelled = {
    surname: 'Jago',
    postcode: 'TR18 1AA',
    signed: '2025-05-01',
    cancelled: '2026-06-01',
  }
  assert.equal(covers(cancelled, '2026-05-31'), true)
  assert.equal(covers(cancelled, '2026-06-01'), false)
})
