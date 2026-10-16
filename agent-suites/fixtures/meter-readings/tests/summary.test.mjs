import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { monthlySummary } from '../src/summary.mjs'

const csv = (text) => {
  const file = join(mkdtempSync(join(tmpdir(), 'meter-')), 'export.csv')
  writeFileSync(file, text)
  return file
}

test('summarises each meter by month', async () => {
  const rows = await monthlySummary(new URL('../data/sample.csv', import.meta.url).pathname)
  assert.deepEqual(rows, [
    {
      meter: 'M-0007',
      month: '2026-01',
      kwh: 0.8,
      peakKwh: 0.412,
      peakAt: '2026-01-31T23:00:00Z',
      readings: 2,
      gaps: 0,
    },
    {
      meter: 'M-0007',
      month: '2026-02',
      kwh: 0.802,
      peakKwh: 0.401,
      peakAt: '2026-02-01T00:00:00Z',
      readings: 2,
      gaps: 0,
    },
    {
      meter: 'M-0012',
      month: '2026-01',
      kwh: 0.12,
      peakKwh: 0.12,
      peakAt: '2026-01-31T23:00:00Z',
      readings: 2,
      gaps: 1,
    },
    {
      meter: 'M-0012',
      month: '2026-02',
      kwh: 0.246,
      peakKwh: 0.131,
      peakAt: '2026-02-01T00:30:00Z',
      readings: 2,
      gaps: 0,
    },
  ])
})

test('a month of gaps has no peak', async () => {
  const rows = await monthlySummary(csv('meter,timestamp,kwh\nM-1,2026-03-01T00:00:00Z,\n'))
  assert.deepEqual(rows, [
    { meter: 'M-1', month: '2026-03', kwh: 0, peakKwh: null, peakAt: null, readings: 1, gaps: 1 },
  ])
})

test('accepts Windows line endings and a missing final newline', async () => {
  const rows = await monthlySummary(
    csv('meter,timestamp,kwh\r\nM-1,2026-03-01T00:00:00Z,0.5\r\nM-1,2026-03-01T00:30:00Z,0.25'),
  )
  assert.equal(rows[0].kwh, 0.75)
  assert.equal(rows[0].readings, 2)
})

test('names the line of a broken row', async () => {
  await assert.rejects(
    monthlySummary(csv('meter,timestamp,kwh\nM-1,2026-03-01T00:00:00Z,0.5\nM-1;oops\n')),
    /line 3/,
  )
})
