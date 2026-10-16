import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseCsv, toSighting } from '../src/csv.mjs'
import { report, tally } from '../src/tally.mjs'

const row = (site, species, count, date = '2026-04-04', observer = 'Tom') => ({
  date,
  site,
  observer,
  species,
  count,
})

test('parses an export with a header line', () => {
  const rows = parseCsv('date,site,observer,species,count\r\n2026-04-04,A,Tom,wren,1\r\n')
  assert.deepEqual(rows.map(toSighting), [row('A', 'wren', 1)])
})

test('rejects a count that is not a whole number', () => {
  assert.throws(() => toSighting({ ...row('A', 'wren', 0), count: 'two' }), RangeError)
})

test('adds up each species per site', () => {
  const totals = tally([row('A', 'wren', 1), row('A', 'robin', 2), row('B', 'wren', 4)])
  assert.equal(totals.get('A').get('wren'), 1)
  assert.equal(totals.get('B').get('wren'), 4)
})

test('a double submission is counted once', () => {
  assert.equal(
    tally([row('A', 'wren', 2), row('A', 'wren', 2)])
      .get('A')
      .get('wren'),
    2,
  )
})

test('reports the largest totals first', () => {
  assert.deepEqual(report(tally([row('A', 'wren', 1), row('A', 'robin', 2)])), [
    'Site A',
    '     2  robin',
    '     1  wren',
  ])
})
