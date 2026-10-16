import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { test } from 'node:test'
import { endTime, parseClock } from '../src/session.mjs'

test('parses a time of day', () => {
  assert.equal(parseClock('09:05'), 545)
  assert.throws(() => parseClock('9:05'), RangeError)
  assert.throws(() => parseClock('24:00'), RangeError)
})

test('adds minutes to a time of day', () => {
  assert.equal(endTime('09:00', 25), '09:25')
  assert.equal(endTime('23:50', 25), '00:15 (next day)')
})

test('start prints the end of a 25-minute session', () => {
  const run = spawnSync(
    process.execPath,
    ['bin/timer.mjs', 'start', '--task', 'Inbox', '--at', '14:40'],
    {
      cwd: new URL('..', import.meta.url),
      encoding: 'utf8',
    },
  )
  assert.equal(run.stdout, 'Inbox: 14:40 → 15:05\n')
})
