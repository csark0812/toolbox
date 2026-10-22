import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildCatalogue } from '../src/catalogue.mjs'

test('one line per cultivar, sorted, with totals and the earliest lift date', () => {
  const lines = buildCatalogue([
    { cultivar: 'late tulip', grams: 500, lifted: '2025-06-10' },
    { cultivar: 'early crocus', grams: 300, lifted: '2025-05-02' },
    { cultivar: 'late tulip', grams: 700, lifted: '2025-06-01' },
  ])
  assert.deepEqual(lines, [
    {
      cultivar: 'early crocus',
      sacks: 1,
      grams: 300,
      lifted: '2025-05-02',
      label: 'Early Crocus - 0.3 kg - lifted 2 May 2025',
    },
    {
      cultivar: 'late tulip',
      sacks: 2,
      grams: 1200,
      lifted: '2025-06-01',
      label: 'Late Tulip - 1.2 kg - lifted 1 Jun 2025',
    },
  ])
})

test('no sacks, no lines', () => {
  assert.deepEqual(buildCatalogue([]), [])
})
