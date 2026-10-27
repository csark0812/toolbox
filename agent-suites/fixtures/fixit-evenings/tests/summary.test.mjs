import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseCsv, summarise } from '../src/summary.mjs'

const csv = `id,evening,item,outcome,part_ordered
A1,2026-01-14,kettle,fixed,no
A2,2026-01-14,lamp,not-fixable,no
A3,2026-01-14,radio,awaiting-part,yes`

test('each outcome is counted', () => {
  assert.deepEqual(summarise(parseCsv(csv)), {
    seen: 3,
    fixed: 1,
    waitingForPart: 1,
    couldNotFix: 1,
  })
})
