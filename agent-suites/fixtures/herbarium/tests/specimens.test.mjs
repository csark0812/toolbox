import assert from 'node:assert/strict'
import { test } from 'node:test'
import { specimenLine } from '../src/specimens.mjs'

const sheet = {
  accession: 'HB1923/417-7',
  taxon: 'Primula vulgaris',
  collector: 'E. Hale',
  collected: '1923-04-12',
}

test('a sheet shows its accession, taxon, collector and date', () => {
  assert.equal(specimenLine(sheet), 'HB1923/417-7  Primula vulgaris  E. Hale  1923-04-12')
})

test('a sheet without a date says so', () => {
  assert.match(specimenLine({ ...sheet, collected: null }), /E\. Hale {2}date unknown$/)
})
