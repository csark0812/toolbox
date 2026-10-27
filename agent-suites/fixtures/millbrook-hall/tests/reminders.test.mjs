import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fromAddress, reminder } from '../src/reminders.mjs'

const booking = {
  group: 'Yoga',
  contact: 'sam@example.org',
  day: 'Wed',
  start: '17:00',
  end: '18:00',
}

test('reminders come from the hall mailbox', () => {
  assert.equal(fromAddress(), 'hire@millbrookhall.org')
})

test('reminders tell hirers where to reply', () => {
  assert.match(reminder(booking), /reply to hire@millbrookhall\.org/)
})
