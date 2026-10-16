import assert from 'node:assert/strict'
import { test } from 'node:test'
import { imageStats, luminance } from '../src/stats.mjs'

const image = (pixels) => Uint8Array.from(pixels.flat())

test('weights the channels for luminance', () => {
  assert.equal(luminance(255, 255, 255), 255)
  assert.equal(luminance(255, 0, 0), 54)
  assert.equal(luminance(0, 255, 0), 182)
})

test('summarises a small image', () => {
  const stats = imageStats(
    image([
      [0, 0, 0, 255],
      [255, 255, 255, 255],
      [100, 100, 100, 255],
      [9, 9, 9, 0],
    ]),
    2,
    2,
  )
  assert.equal(stats.pixels, 3)
  assert.equal(stats.mean, 118.33)
  assert.equal(stats.median, 100)
  assert.equal(stats.p1, 0)
  assert.equal(stats.p99, 255)
  assert.equal(stats.clippedBlack, 1)
  assert.equal(stats.clippedWhite, 1)
  assert.equal(stats.histogram[100], 1)
})

test('handles an empty image', () => {
  const stats = imageStats(new Uint8Array(0), 0, 0)
  assert.deepEqual([stats.pixels, stats.mean, stats.median], [0, null, null])
})
