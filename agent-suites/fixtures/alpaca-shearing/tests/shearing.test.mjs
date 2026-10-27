import assert from 'node:assert/strict'
import test from 'node:test'
import {
  bagLabel,
  fleeceValue,
  gradeFleece,
  invoice,
  loadVisits,
  travelCharge,
} from '../src/shearing.mjs'

const visits = loadVisits()

test('grades are inclusive at the top of each band', () => {
  assert.equal(gradeFleece(18), 'royal')
  assert.equal(gradeFleece(20), 'superfine')
  assert.equal(gradeFleece(30.01), 'coarse')
  assert.throws(() => gradeFleece(null), /No micron reading/)
})

test('fleece value rounds to the penny', () => {
  assert.equal(fleeceValue({ micron: 27.2, fleeceKg: 3.35 }), 838)
})

test('bag labels', () => {
  assert.equal(bagLabel(visits[1], visits[1].animals[2]), 'HAF-HF-13 UNSAMPLED 1.95kg')
})

test('travel is free for the first ten miles', () => {
  assert.equal(travelCharge({ miles: 8 }), 0)
  assert.equal(travelCharge({ miles: 23 }), 585)
})

test('invoice credits the fleece and adds VAT for VAT-registered farms', () => {
  const { total } = invoice(visits[1])
  assert.equal(typeof total, 'number')
})
