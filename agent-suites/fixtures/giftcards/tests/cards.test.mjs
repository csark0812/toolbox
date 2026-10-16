import assert from 'node:assert/strict'
import { test } from 'node:test'
import { findCard, issueCard } from '../src/cards.mjs'
import { createStore } from '../src/store.mjs'

test('issues a card', () => {
  const store = createStore()
  const card = issueCard(store, { code: 'GIFT-2026-AB12', balanceCents: 5000, expiresAt: 1e13 })
  assert.equal(card.balanceCents, 5000)
  assert.deepEqual(card.history, [])
  assert.equal(findCard(store, 'GIFT-2026-AB12'), card)
})

test('rejects bad cards', () => {
  const store = createStore()
  assert.throws(() => issueCard(store, { code: 'nope', balanceCents: 100, expiresAt: 1e13 }))
  assert.throws(() => issueCard(store, { code: 'GIFT-2026-AB12', balanceCents: 0, expiresAt: 1 }))
})
