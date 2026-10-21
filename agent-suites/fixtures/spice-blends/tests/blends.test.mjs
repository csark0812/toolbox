import assert from 'node:assert/strict'
import { test } from 'node:test'
import { findBlend, loadBlends } from '../src/blends.mjs'

test('blends are found by name in any case', () => {
  const blends = loadBlends()
  assert.equal(findBlend(blends, 'Pumpkin Spice').length, 4)
  assert.equal(findBlend(blends, 'curry'), undefined)
})
