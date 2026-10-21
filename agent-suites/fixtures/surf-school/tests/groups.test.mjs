import assert from 'node:assert/strict'
import { test } from 'node:test'
import { groups } from '../src/groups.mjs'

const pupils = [
  { name: 'Ana', age: 9, level: 'beginner', pack: null },
  { name: 'Ben', age: 34, level: 'advanced', pack: null },
  { name: 'Cal', age: 12, level: 'beginner', pack: null },
]

test('pupils are grouped by level', () => {
  assert.deepEqual(groups(pupils), ['beginner: Ana, Cal', 'improver: nobody', 'advanced: Ben'])
})
