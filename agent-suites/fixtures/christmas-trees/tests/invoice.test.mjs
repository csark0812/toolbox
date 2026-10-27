import assert from 'node:assert/strict'
import { test } from 'node:test'
import { bandPrice, invoice } from '../src/invoice.mjs'

test('each height band has its price', () => {
  assert.equal(bandPrice(120), 3000)
  assert.equal(bandPrice(165), 4200)
  assert.equal(bandPrice(200), 5500)
})

test('delivery is added on top of the tree', () => {
  assert.deepEqual(
    invoice({ tag: 'T1', customer: 'A', height: 160, delivery: true, by: 'office' }),
    {
      cm: 160,
      tree: 4200,
      delivery: 800,
      total: 5000,
    },
  )
  assert.equal(
    invoice({ tag: 'T2', customer: 'B', height: 140, delivery: false, by: 'office' }).total,
    3000,
  )
})
