import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { loadSessions } from '../src/sessions.mjs'
import { weeklyReport } from '../src/report.mjs'

const data = fileURLToPath(new URL('../data/sessions.json', import.meta.url))

test('sessions load with their type tidied', (t, done) => {
  loadSessions(data, (error, sessions) => {
    assert.equal(error, null)
    assert.equal(sessions[1].type, 'lessons')
    done()
  })
})

test('a missing file is an error', (t, done) => {
  loadSessions('no-such-file.json', (error) => {
    assert.equal(error.code, 'ENOENT')
    done()
  })
})

test('the weekly report adds up each type', async () => {
  const report = await weeklyReport(data)
  assert.deepEqual(report[0], { type: 'public skate', booked: 363, capacity: 750 })
})
