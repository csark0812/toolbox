import assert from 'node:assert/strict'
import { test } from 'node:test'
import { formatDollars, totalsByPerson } from '../src/totals.mjs'

test('totals per person, sorted by name', () => {
  const totals = totalsByPerson([
    { person: 'mark', amount: 10 },
    { person: 'ines', amount: 2.5 },
    { person: 'mark', amount: 5.25 },
  ])
  assert.deepEqual(totals, [
    { person: 'ines', total: 2.5 },
    { person: 'mark', total: 15.25 },
  ])
  assert.equal(formatDollars(15.25), '$15.25')
})
