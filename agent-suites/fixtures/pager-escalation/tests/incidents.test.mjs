import assert from 'node:assert/strict'
import { test } from 'node:test'
import { openIncident } from '../src/incidents.mjs'
import { page, sent } from '../src/pager.mjs'

test('opens incidents', () => {
  const incident = openIncident('Checkout errors', 'critical')
  assert.equal(incident.status, 'open')
  assert.throws(() => openIncident('x', 'meh'), RangeError)
})

test('records pages', () => {
  page('mira', { id: 'INC-x' })
  assert.equal(sent.at(-1).to, 'mira')
})
