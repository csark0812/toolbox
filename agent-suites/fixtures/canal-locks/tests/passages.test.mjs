import assert from 'node:assert/strict'
import { test } from 'node:test'
import { minutesInLock, passageLine } from '../src/passages.mjs'

const passage = { date: '2026-10-12', lock: 14, boat: 'Kingfisher', in: '09:05', out: '09:22' }

test('time in the lock', () => {
  assert.equal(minutesInLock(passage), 17)
  assert.equal(minutesInLock({ in: '11:10', out: '13:25' }), 135)
})

test('a log line', () => {
  assert.equal(passageLine(passage), '2026-10-12  Lock 14  Kingfisher    09:05-09:22   17 min')
})
