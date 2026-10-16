import assert from 'node:assert/strict'
import { test } from 'node:test'
import { completion, outcome, progressLine } from '../src/progress.mjs'

test('rounds completion down', () => {
  assert.equal(completion({ lessons: 3, done: 2 }), 66)
  assert.equal(completion({ lessons: 0, done: 0 }), 0)
})

test('decides the outcome', () => {
  assert.equal(outcome({ lessons: 2, done: 2, mark: 80 }), 'passed')
  assert.equal(outcome({ lessons: 2, done: 2, mark: 79 }), 'failed')
  assert.equal(outcome({ lessons: 2, done: 1, mark: null }), 'in progress')
})

test('prints a progress line', () => {
  assert.equal(
    progressLine({ name: 'Ana', course: 'Fire Safety', lessons: 4, done: 1, mark: null }),
    'Ana: Fire Safety 25% (in progress)',
  )
})
