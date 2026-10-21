import assert from 'node:assert/strict'
import { test } from 'node:test'
import { bill, billLine } from '../src/bills.mjs'

test('a full plot pays full rent plus water', () => {
  assert.deepEqual(bill({ size: 1 }), { rent: 60, water: 12, total: 72 })
})

test('the bill line names the plot and holder', () => {
  assert.match(billLine({ plot: 7, holder: 'Gus Lee', size: 1 }), /^Plot {2}7 {2}Gus Lee/)
})
