import assert from 'node:assert/strict'
import { test } from 'node:test'
import { normalizeHeader } from '../src/columns.mjs'
import { coerce } from '../src/coerce.mjs'
import { importContacts } from '../src/import.mjs'

test('normalizes headers', () => {
  assert.equal(normalizeHeader(' First Name '), 'first_name')
  assert.equal(normalizeHeader('E-mail'), 'e_mail')
})

test('keeps identifier columns as text', () => {
  assert.equal(coerce('phone', '6175550142'), '6175550142')
  assert.equal(coerce('zip', '02134'), '02134')
  assert.equal(coerce('lifetime_value', '830'), 830)
  assert.equal(coerce('company', ''), null)
})

test('imports records keyed by header', () => {
  const [row] = importContacts('Name,Phone,Zip\nAda,0123,02134\n')
  assert.deepEqual(row, { name: 'Ada', phone: '0123', zip: '02134' })
})
