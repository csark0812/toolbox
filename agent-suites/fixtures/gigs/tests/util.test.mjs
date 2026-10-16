import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fmtWhen, priceLabel, slug } from '../src/util.mjs'

test('slug', () => {
  assert.equal(slug('Night Owls & Co.'), 'night-owls-co')
})

test('priceLabel', () => {
  assert.equal(priceLabel(0), 'Free')
  assert.equal(priceLabel(1800), '$18')
  assert.equal(priceLabel(1505), '$15.05')
})

test('fmtWhen uses the venue time zone', () => {
  assert.equal(fmtWhen('2026-10-16T00:00:00Z', 'America/New_York'), 'Thu, Oct 15, 8:00 PM')
})
