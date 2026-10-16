import assert from 'node:assert/strict'
import { test } from 'node:test'
import { weekTable } from '../src/hours.mjs'

test('prints each day of the week', () => {
  const table = weekTable({ mon: 'closed', tue: '08:00-16:00', fri: '08:00-16:00,18:00-01:00' })
  assert.equal(table.length, 7)
  assert.equal(table[0], 'Mon  closed')
  assert.equal(table[1], 'Tue  08:00–16:00')
  assert.equal(table[4], 'Fri  08:00–16:00, 18:00–01:00')
  assert.equal(table[6], 'Sun  closed')
})
