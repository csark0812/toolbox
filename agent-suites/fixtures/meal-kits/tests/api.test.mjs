import assert from 'node:assert/strict'
import { test } from 'node:test'
import { handleGetSubscription, handleSkipWeek } from '../src/api.mjs'
import { isoDay, loadStore } from '../src/store.mjs'

test('a customer sees their own subscription', () => {
  const response = handleGetSubscription(loadStore(), {}, { customerId: 'c-101' })
  assert.equal(response.body.name, 'Priya Nair')
  assert.equal(response.body.nextDelivery, '2026-10-22')
})

test('skipping moves the next delivery on a week', () => {
  const store = loadStore()
  const response = handleSkipWeek(store, {}, { customerId: 'c-102' })
  assert.deepEqual(response.body, { skipped: '2026-10-22' })
  assert.equal(isoDay(store.get('c-102').nextDelivery), '2026-10-29')
})
