import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ticket } from '../src/tickets.mjs'

test('a ticket shows the number, the customer and the job', () => {
  assert.equal(
    ticket({ ticket: 301, customer: 'A. Morgan', job: 'heels', in: '2026-12-11' }),
    '#301  A. Morgan  heels',
  )
})
