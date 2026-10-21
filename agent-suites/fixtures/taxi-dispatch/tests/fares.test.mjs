import assert from 'node:assert/strict'
import { test } from 'node:test'
import { byDriver, fare, inOrder } from '../src/fares.mjs'

const job = (fields) => ({
  date: '2026-11-07',
  time: '12:00',
  miles: 0,
  waitMins: 0,
  driver: 'Dot',
  ...fields,
})

test('the day fare is the flag plus the miles', () => {
  assert.equal(fare(job({ miles: 3 })), 900)
  assert.equal(fare(job({ miles: 1.5 })), 600)
})

test('waiting time is added by the minute', () => {
  assert.equal(fare(job({ miles: 2, waitMins: 4 })), 800)
})

test('jobs come out in pickup order and are totalled by driver', () => {
  const jobs = [job({ time: '09:00', miles: 1 }), job({ time: '08:00', miles: 2, driver: 'Ann' })]
  assert.deepEqual(
    inOrder(jobs).map((j) => j.time),
    ['08:00', '09:00'],
  )
  assert.deepEqual(byDriver(jobs), [
    ['Ann', 700],
    ['Dot', 500],
  ])
})
