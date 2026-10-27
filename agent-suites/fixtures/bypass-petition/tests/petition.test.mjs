import assert from 'node:assert/strict'
import { test } from 'node:test'
import { normalisePostcode, parsePostcodes, parseSignatures, tally } from '../src/petition.mjs'

const parish = parsePostcodes('TR13 8AB\nTR13 8DE\n')

test('postcodes are compared without regard to capitals', () => {
  assert.equal(normalisePostcode('tr13 8ab'), 'TR13 8AB')
  assert.ok(parish.has(normalisePostcode(' Tr13 8de ')))
})

test('signatures from outside the parish are rejected', () => {
  const { valid, rejected } = tally(
    parseSignatures('date,name,postcode,source\n2026-09-01,Ann Rowe,TR12 7JL,paper'),
    parish,
  )
  assert.equal(valid.length, 0)
  assert.equal(rejected[0].reason, 'not in the parish')
})

test('one person, one signature', () => {
  const { valid, rejected, short } = tally(
    parseSignatures(`date,name,postcode,source
2026-09-01,Ann Rowe,TR13 8AB,paper
2026-09-03,Ann Rowe,tr13 8ab,online
2026-09-04,Bill Rowe,TR13 8AB,online`),
    parish,
  )
  assert.deepEqual(
    valid.map((signature) => signature.name),
    ['Ann Rowe', 'Bill Rowe'],
  )
  assert.equal(rejected[0].reason, 'already signed')
  assert.equal(short, 248)
})
