import assert from 'node:assert/strict'
import { test } from 'node:test'
import { daysBetween, parseDay } from '../src/dates.mjs'
import { parseLog } from '../src/log.mjs'
import { overdue } from '../src/overdue.mjs'

const log = (lines) => parseLog(['hive,date,inspector,queen_seen', ...lines].join('\n'))

test('parses the log book columns', () => {
  assert.deepEqual(log(['3,05/10/2026,Mara,yes']), [
    { hive: '3', date: '05/10/2026', inspector: 'Mara', queenSeen: true },
  ])
})

test('counts whole days', () => {
  assert.equal(daysBetween(parseDay('01/10/2026'), parseDay('15/10/2026')), 14)
})

test('a hive is overdue after more than 14 days', () => {
  const rows = log(['1,01/10/2026,Mara,yes', '2,02/10/2026,Joe,yes'])
  assert.deepEqual(overdue(rows, new Date(2026, 9, 16)), [
    { hive: '1', last: '01/10/2026', days: 15 },
  ])
})

test('only the latest inspection counts', () => {
  const rows = log(['1,01/09/2026,Mara,yes', '1,05/09/2026,Mara,yes'])
  assert.deepEqual(overdue(rows, new Date(2026, 8, 21)), [
    { hive: '1', last: '05/09/2026', days: 16 },
  ])
})
