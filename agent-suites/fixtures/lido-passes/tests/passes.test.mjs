import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isValid } from '../src/passes.mjs'

const pass = { start: '2026-07-01', end: '2026-09-28', status: 'active' }

test('valid from the first day to the last day', () => {
  assert.equal(isValid(pass, '2026-07-01'), true)
  assert.equal(isValid(pass, '2026-08-15'), true)
  assert.equal(isValid(pass, '2026-09-28'), true)
})

test('not valid outside its dates', () => {
  assert.equal(isValid(pass, '2026-06-30'), false)
  assert.equal(isValid(pass, '2026-09-29'), false)
})

test('only active passes are valid', () => {
  assert.equal(isValid({ ...pass, status: 'pending' }, '2026-08-15'), false)
  assert.equal(isValid({ ...pass, status: 'refunded' }, '2026-08-15'), false)
})
