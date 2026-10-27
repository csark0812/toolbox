import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { batchLabel, batchSummary, findBatch } from '../src/batches.mjs'
import { isReady, loadWheels } from '../src/wheels.mjs'

const wheels = loadWheels(fileURLToPath(new URL('../data/wheels.json', import.meta.url)))

test('a batch holds its wheels', () => {
  assert.deepEqual(
    findBatch(wheels, 'B-18').map((wheel) => wheel.wheelId),
    ['W-104', 'W-105', 'W-109'],
  )
})

test('the summary counts ready wheels per batch', () => {
  assert.deepEqual(batchSummary(wheels, '2026-10-21')[0], {
    batchId: 'B-17',
    cheese: 'Tomme',
    wheels: 3,
    ready: 3,
  })
})

test('labels name the batch', () => {
  assert.equal(batchLabel('B-21'), 'Batch B-21')
})

test('cheddar needs 270 days', () => {
  const [w104] = findBatch(wheels, 'B-18')
  assert.equal(isReady(w104, '2026-10-16'), false)
  assert.equal(isReady(w104, '2026-10-17'), true)
})
