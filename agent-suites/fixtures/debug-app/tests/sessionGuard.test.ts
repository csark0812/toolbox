import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { isSessionValid } from '../src/sessionGuard.ts'

describe('isSessionValid', () => {
  it('rejects sessions that expire exactly at now', () => {
    const now = 1_700_000_000_000
    assert.equal(isSessionValid(now, now), false)
  })

  it('accepts sessions that expire after now', () => {
    const now = 1_700_000_000_000
    assert.equal(isSessionValid(now + 1, now), true)
  })
})
