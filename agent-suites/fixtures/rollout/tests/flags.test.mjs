import assert from 'node:assert/strict'
import { test } from 'node:test'
import { eligible, isEnabled } from '../src/flags.mjs'
import { bucket } from '../src/hash.mjs'

test('buckets are stable and in range', () => {
  assert.equal(bucket('x', 'u1'), bucket('x', 'u1'))
  for (let i = 0; i < 200; i++) assert.ok(bucket('x', `u${i}`) >= 0 && bucket('x', `u${i}`) < 100)
})

test('applies targeting rules', () => {
  const flag = { percent: 100, rules: { countries: ['IE'], minAppVersion: '5.2.0' } }
  assert.equal(eligible(flag, { country: 'IE', appVersion: '5.10.0' }), true)
  assert.equal(eligible(flag, { country: 'IE', appVersion: '5.1.9' }), false)
  assert.equal(eligible(flag, { country: 'FR', appVersion: '6.0.0' }), false)
})

test('a full rollout reaches everyone', () => {
  assert.equal(isEnabled('dark-mode', { id: 'anyone', country: 'US', appVersion: '1.0.0' }), true)
})
