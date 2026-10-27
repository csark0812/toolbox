import assert from 'node:assert/strict'
import { test } from 'node:test'
import { loadConfig } from '../src/config.mjs'
import { invoiceLines } from '../src/invoice.mjs'
import { findJob, loadJobs } from '../src/jobs.mjs'

test('a rush weekend job carries both surcharges', () => {
  const invoice = invoiceLines(findJob(loadJobs(), 'J-1044'), loadConfig())
  assert.deepEqual(
    invoice.lines.map((line) => line.label),
    ['Repair: Wristwatch', 'Urgent surcharge', 'Weekend surcharge'],
  )
  assert.equal(invoice.total, 8160)
})

test('an ordinary job has no surcharge', () => {
  const invoice = invoiceLines(findJob(loadJobs(), 'J-1040'), loadConfig())
  assert.equal(invoice.lines.length, 1)
  assert.equal(invoice.total, 22200)
})
