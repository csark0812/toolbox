import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parsePasses, takings } from '../src/takings.mjs'

const csv = `id,holder,type,month,status
A1,One,adult,2026-10,active
A2,Two,junior,2026-10,active
A3,Three,adult,2026-10,cancelled
A4,Four,senior,2026-09,active`

test('takings add up the month the passes are for', () => {
  assert.equal(takings(parsePasses(csv), '2026-10'), 78)
})

test('a cancelled pass is not counted', () => {
  const passes = parsePasses(csv)
  assert.equal(takings(passes, '2026-10'), 48 + 30)
})
