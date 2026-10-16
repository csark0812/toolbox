import assert from 'node:assert/strict'
import { test } from 'node:test'
import { letter, mean, overall } from '../src/grades.mjs'

test('averages marked work only', () => {
  assert.equal(mean([80, null, 90]), 85)
  assert.equal(mean([null]), null)
})

test('averages across categories', () => {
  assert.equal(overall({ marks: { a: [100], b: [80, 90] } }), 90)
})

test('maps percentages to letters', () => {
  assert.equal(letter(90), 'A')
  assert.equal(letter(89.9), 'B')
  assert.equal(letter(59), 'F')
})
