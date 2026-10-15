import assert from 'node:assert/strict'
import { test } from 'node:test'
import { groupByLocalDay, utilization } from '../src/report.mjs'

test('groups by local day in winter', () => {
  const days = groupByLocalDay(
    [
      { id: 'a', at: '2026-01-15T03:00:00Z' },
      { id: 'b', at: '2026-01-15T06:00:00Z' },
      { id: 'c', at: '2026-01-16T17:00:00Z' },
    ],
    'America/Toronto',
  )
  assert.deepEqual(days, { '2026-01-14': ['a'], '2026-01-15': ['b'], '2026-01-16': ['c'] })
})

test('utilization is a whole percent', () => {
  assert.equal(utilization(7, 12), 58)
})
