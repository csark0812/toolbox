import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { fastestRoute } from '../src/planner.mjs'

const network = JSON.parse(readFileSync(new URL('../data/network.json', import.meta.url), 'utf8'))

test('finds the quickest route', () => {
  assert.deepEqual(fastestRoute(network, 'ELM', 'HBR'), {
    minutes: 12,
    stops: ['ELM', 'MKT', 'PRK', 'HBR'],
  })
})

test('links are one-way', () => {
  assert.deepEqual(fastestRoute(network, 'HBR', 'PRK'), {
    minutes: 16,
    stops: ['HBR', 'STN', 'MKT', 'PRK'],
  })
})

test('a stop to itself takes no time', () => {
  assert.deepEqual(fastestRoute(network, 'UNI', 'UNI'), { minutes: 0, stops: ['UNI'] })
})

test('null when the destination cannot be reached', () => {
  assert.equal(fastestRoute(network, 'ELM', 'DEP'), null)
})

test('an unknown stop is an error', () => {
  assert.throws(() => fastestRoute(network, 'ELM', 'XYZ'), RangeError)
})

test('leaves the network alone', () => {
  const before = JSON.stringify(network)
  fastestRoute(network, 'ELM', 'HBR')
  assert.equal(JSON.stringify(network), before)
})
