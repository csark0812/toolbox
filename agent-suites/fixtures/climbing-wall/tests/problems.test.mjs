import assert from 'node:assert/strict'
import { test } from 'node:test'
import { problemLine } from '../src/problems.mjs'

test('a problem shows its id, name, grade and setter', () => {
  assert.equal(
    problemLine({ id: 'P2', name: 'The Prow', grade: '6b+', setter: 'Ade' }),
    'P2   The Prow      6b+   Ade',
  )
})
