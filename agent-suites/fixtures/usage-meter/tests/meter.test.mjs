import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createMeter } from '../src/meter.mjs'

const at = (hour) => Date.UTC(2026, 0, 5, hour)

test('allows usage up to the daily limit', () => {
  const meter = createMeter({ dailyLimit: 10 })
  assert.equal(meter.record('acme', 6, at(2)), true)
  assert.equal(meter.record('acme', 4, at(3)), true)
  assert.equal(meter.record('acme', 1, at(4)), false)
})

test('accounts are counted separately', () => {
  const meter = createMeter({ dailyLimit: 5 })
  assert.equal(meter.record('acme', 5, at(1)), true)
  assert.equal(meter.record('globex', 5, at(1)), true)
})
