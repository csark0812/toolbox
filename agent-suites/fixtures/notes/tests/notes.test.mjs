import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createNote } from '../src/notes.mjs'
test('requires a title', () => {
  assert.throws(() => createNote({ body: 'x' }))
})
