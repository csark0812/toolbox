import assert from 'node:assert/strict'
import { test } from 'node:test'
import { serviceLine } from '../src/services.mjs'

test('a service shows its date, name and hymns', () => {
  assert.equal(
    serviceLine({ date: '2026-11-01', name: 'All Saints', hymns: ['33', '372 v1-3,5'] }),
    '2026-11-01  All Saints           33 | 372 v1-3,5',
  )
})
