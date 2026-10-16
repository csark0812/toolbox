import assert from 'node:assert/strict'
import { test } from 'node:test'
import { money, row, ticket } from '../src/jobs.mjs'

test('labour is charged by the hour', () => {
  const { lines, total } = ticket({ labourHours: 1.5, parts: [] })
  assert.deepEqual(lines, [{ label: 'Labour 1.5 h', pence: 6000 }])
  assert.equal(total, 6000)
})

test('a single part is charged once', () => {
  const { total } = ticket({ labourHours: 0, parts: [{ name: 'Chain', pence: 1899, qty: 1 }] })
  assert.equal(total, 1899)
})

test('money in pounds', () => {
  assert.equal(money(1234), '£12.34')
})

test('board rows pad each column', () => {
  assert.equal(
    row(['J-1', 'Ana', 'Bike', 'open', '2026-10-16']),
    'J-1    Ana         Bike               open           2026-10-16',
  )
})
