import assert from 'node:assert/strict'
import { test } from 'node:test'
import { formatTicket, jobTicket } from '../src/ticket.mjs'

const doc = { title: 'Notes', pages: 5 }

test('prices a job', () => {
  const ticket = jobTicket(doc, [1, 2, 3], { copies: 2, duplex: true })
  assert.deepEqual([ticket.sheets, ticket.priceCents], [4, 54])
})

test('formats a ticket', () => {
  assert.equal(
    formatTicket(jobTicket(doc, [1, 2])),
    'title: Notes\npages: 1,2\ncopies: 1\nsheets: 2\nprice: $0.18',
  )
})
