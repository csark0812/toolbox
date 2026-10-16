import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const cli = fileURLToPath(new URL('../bin/atlas.mjs', import.meta.url))
const atlas = (...args) => execFileSync(process.execPath, [cli, ...args], { encoding: 'utf8' })

test('looks up capitals', () => {
  assert.equal(atlas('capital', 'peru', 'New Zealand'), 'Peru: Lima\nNew Zealand: Wellington\n')
})

test('looks up currencies', () => {
  assert.equal(atlas('currency', 'Norway'), 'Norway: NOK (Krone)\n')
})

test('measures routes', () => {
  assert.equal(atlas('route', 'Portugal', 'Morocco'), 'Lisbon to Rabat: 562 km\n')
})

test('finds the nearest place', () => {
  assert.match(atlas('nearest', '0', '0'), /^[A-Z][a-z]+ \(-?[\d.]+, -?[\d.]+\), [\d.]+ km away\n$/)
})
