import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fromIso, toIso } from '../src/dates.mjs'
import { mooringStatus, parseInspections } from '../src/moorings.mjs'

const LIFTS = 'mooring,date,inspector\nM-01,2025-09-20,yard\nM-02,2025-12-01,yard\n'
const DIVES = 'mooring,date,diver\nM-02,05/05/2026,Kernow Diving\n'

const status = (today) =>
  Object.fromEntries(
    mooringStatus(['M-01', 'M-02', 'M-03'], parseInspections(LIFTS, DIVES), today).map((row) => [
      row.mooring,
      row,
    ]),
  )

test('a mooring is due twelve months after its last lift', () => {
  const row = status('2026-06-01')['M-01']
  assert.equal(toIso(row.due), '2026-09-20')
  assert.equal(row.status, 'OK')
})

test('a dive after the last lift counts', () => {
  assert.equal(toIso(status('2026-06-01')['M-02'].last), '2026-05-05')
})

test('due within 30 days, then overdue', () => {
  assert.equal(status('2026-09-01')['M-01'].status, 'DUE SOON')
  assert.equal(status('2026-09-21')['M-01'].status, 'OVERDUE')
})

test('a mooring never inspected is overdue', () => {
  assert.equal(status('2026-06-01')['M-03'].status, 'OVERDUE')
})

test('ISO dates read as UTC days', () => {
  assert.equal(toIso(fromIso('2026-02-28')), '2026-02-28')
})
