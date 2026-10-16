import assert from 'node:assert/strict'
import { test } from 'node:test'
import { monthly, perFill } from '../src/economy.mjs'

const fills = [
  { date: '2026-01-01', odometer: 1000, gallons: 10, full: true },
  { date: '2026-01-10', odometer: 1250, gallons: 10, full: true },
  { date: '2026-01-20', odometer: 1550, gallons: 12, full: true },
]

test('computes miles per gallon per fill', () => {
  assert.deepEqual(
    perFill(fills).map((row) => row.mpg),
    [25, 25],
  )
})

test('averages per month', () => {
  assert.deepEqual(monthly(fills), [{ month: '2026-01', mpg: 25 }])
})
