import assert from 'node:assert/strict'
import { test } from 'node:test'
import { gradeFor, percentage } from '../src/grades.mjs'

test('the percentage is the total over 200', () => {
  assert.equal(percentage({ papers: [80, 75] }), 77.5)
})

test('grade boundaries', () => {
  assert.equal(gradeFor(70), 'A')
  assert.equal(gradeFor(65), 'B')
  assert.equal(gradeFor(50), 'C')
  assert.equal(gradeFor(41), 'D')
  assert.equal(gradeFor(12), 'U')
})
