import assert from 'node:assert/strict'
import { test } from 'node:test'
import { report } from '../src/report.mjs'

const repairs = [
  {
    ticket: 1,
    item: 'kettle',
    category: 'electrical',
    outcome: 'fixed',
    mains: true,
    patTested: true,
  },
  { ticket: 2, item: 'jeans', category: 'textile', outcome: 'fixed' },
  { ticket: 3, item: 'stool', category: 'furniture', outcome: 'unfixable' },
]

test('the report counts each outcome', () => {
  assert.deepEqual(report(repairs), [
    'Items seen: 3',
    'Fixed: 2',
    'Advice given: 0',
    'Not fixable: 1',
  ])
})
