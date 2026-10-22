import assert from 'node:assert/strict'
import { test } from 'node:test'
import { hireLine } from '../src/hires.mjs'
import { pounds } from '../src/money.mjs'

const hire = { id: 'H01', date: '2026-08-15', boat: 'Swan 1', out: '09:00', back: '09:30' }

test('a hire shows its id, date, boat and times', () => {
  assert.equal(hireLine(hire), 'H01  2026-08-15  Swan 1  09:00 to 09:30')
})

test('a boat on the water is still out', () => {
  assert.equal(hireLine({ ...hire, back: null }), 'H01  2026-08-15  Swan 1  09:00 still out')
})

test('pence are shown as pounds', () => {
  assert.equal(pounds(5), '£0.05')
  assert.equal(pounds(14250), '£142.50')
})
