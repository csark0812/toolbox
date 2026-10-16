import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { describe, kinship } from '../src/kinship.mjs'

const people = JSON.parse(readFileSync(new URL('../data/people.json', import.meta.url), 'utf8'))

test('a parent is the common ancestor of their child', () => {
  assert.deepEqual(kinship(people, 'P07', 'P11'), { ancestor: 'P07', up: 0, down: 1 })
  assert.equal(describe({ up: 0, down: 1 }), 'parent')
})

test('siblings share their parents, the lower id wins the tie', () => {
  assert.deepEqual(kinship(people, 'P07', 'P09'), { ancestor: 'P03', up: 1, down: 1 })
})

test('first cousins through the nearer route', () => {
  assert.deepEqual(kinship(people, 'P11', 'P12'), { ancestor: 'P04', up: 2, down: 2 })
  assert.equal(describe({ up: 2, down: 2 }), '1st cousin')
})

test('strangers share nobody', () => {
  assert.equal(kinship(people, 'P09', 'P13'), null)
})

test('an unknown id throws', () => {
  assert.throws(() => kinship(people, 'P01', 'P99'), /P99/)
})
