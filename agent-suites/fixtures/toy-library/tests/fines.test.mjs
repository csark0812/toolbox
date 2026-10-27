import assert from 'node:assert/strict'
import { test } from 'node:test'
import { daysLate, finesByFamily } from '../src/fines.mjs'

test('a toy returned early is not late', () => {
  assert.equal(daysLate({ due: '2026-10-30', returned: '2026-10-29' }, '2026-11-02'), 0)
})

test('fines add up by family', () => {
  const loans = [
    { family: 'Okoro', toy: 'A', due: '2026-10-01', returned: '2026-10-11' },
    { family: 'Okoro', toy: 'B', due: '2026-10-01', returned: '2026-10-21' },
  ]
  assert.equal(finesByFamily(loans, '2026-11-02')[0].toys, 2)
})
