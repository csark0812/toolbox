import assert from 'node:assert/strict'
import { test } from 'node:test'
import { members, nominations } from '../src/members.mjs'

test('nominations come oldest first', () => {
  assert.deepEqual(
    nominations().map((n) => n.title),
    ['Piranesi', 'The Overstory', 'Small Things Like These'],
  )
})

test('the membership list', () => {
  assert.equal(members().length, 16)
})
