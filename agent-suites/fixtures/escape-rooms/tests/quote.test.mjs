import assert from 'node:assert/strict'
import { test } from 'node:test'
import { money, quote } from '../src/quote.mjs'

const vault = { name: 'The Vault', pence: 2500 }

test('priced per player', () => {
  assert.equal(quote(vault, 4, '2026-10-21').total, 10000)
})

test('rooms take 2 to 10 players', () => {
  assert.throws(() => quote(vault, 1, '2026-10-21'), RangeError)
  assert.throws(() => quote(vault, 11, '2026-10-21'), RangeError)
})

test('money shows pounds and a sign', () => {
  assert.equal(money(1500), '£15.00')
  assert.equal(money(-1500), '-£15.00')
})
