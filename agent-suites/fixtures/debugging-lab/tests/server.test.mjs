import { test } from 'node:test'
import assert from 'node:assert/strict'
import { makeServer } from '../src/server.mjs'
test('constructs a server', () => {
  assert.equal(typeof makeServer().listen, 'function')
})
