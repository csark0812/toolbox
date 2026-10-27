import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isUrgent, urgentDueDate, urgentQueue } from '../src/urgent.mjs'

const config = { turnaroundDays: 14, urgentTurnaroundDays: 3 }

test('a rush job is due in three days, others in a fortnight', () => {
  assert.equal(urgentDueDate({ booked: '2026-10-30', urgent: true }, config), '2026-11-02')
  assert.equal(urgentDueDate({ booked: '2026-10-30', urgent: false }, config), '2026-11-13')
})

test('rush jobs go first, then oldest first', () => {
  const queue = urgentQueue([
    { ref: 'a', booked: '2026-10-01', urgent: false },
    { ref: 'b', booked: '2026-10-03', urgent: true },
    { ref: 'c', booked: '2026-10-02', urgent: true },
  ])
  assert.deepEqual(
    queue.map((job) => job.ref),
    ['c', 'b', 'a'],
  )
  assert.equal(isUrgent(queue[0]), true)
})
