import assert from 'node:assert/strict'
import { test } from 'node:test'
import { countEvents, createDb, selectEvents } from '../src/db.mjs'
import { record } from '../src/events.mjs'

test('records events and pages through older ones', () => {
  const db = createDb()
  record(db, 'ana', 'login', 1000)
  record(db, 'ana', 'export', 2000)
  record(db, 'bo', 'login', 3000)
  assert.equal(countEvents(db), 3)
  assert.deepEqual(
    selectEvents(db, { before: 3000, limit: 1, offset: 1 }).map((e) => e.action),
    ['export'],
  )
  assert.throws(() => record(db, 'ana', 'dance'), RangeError)
})
