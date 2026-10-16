import assert from 'node:assert/strict'
import { test } from 'node:test'
import { clashWith, dayLabel, problemWith, weekOf } from '../src/hall.mjs'

const bookings = [{ room: 'main', date: '2026-10-22', start: '17:00', end: '18:00', hirer: 'Yoga' }]
const request = (start, end, room = 'main') => ({ room, date: '2026-10-22', start, end })

test('an overlapping request clashes', () => {
  assert.equal(clashWith(bookings, request('17:30', '19:00')).hirer, 'Yoga')
})

test('another room does not clash', () => {
  assert.equal(clashWith(bookings, request('17:30', '19:00', 'small')), undefined)
})

test('requests must fit the opening hours', () => {
  assert.equal(problemWith(request('07:30', '09:00')), 'outside opening hours (08:00-22:00)')
  assert.equal(problemWith(request('10:00', '12:00')), null)
})

test('a booking ends after it starts', () => {
  assert.equal(problemWith(request('12:00', '12:00')), 'a booking must end after it starts')
})

test('day labels and weeks', () => {
  assert.equal(dayLabel('2026-10-22'), 'Thu 22 Oct')
  assert.deepEqual(weekOf('2026-10-19').slice(-1), ['2026-10-25'])
})
