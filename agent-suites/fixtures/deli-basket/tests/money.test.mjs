import assert from 'node:assert/strict'
import { test } from 'node:test'
import { memberSaving, pounds } from '../src/money.mjs'

test('pence print as pounds', () => {
  assert.equal(pounds(450), '£4.50')
  assert.equal(pounds(5), '£0.05')
})

test('the member saving rounds down to a whole penny', () => {
  assert.equal(memberSaving(2170), 217)
  assert.equal(memberSaving(999), 99)
})
