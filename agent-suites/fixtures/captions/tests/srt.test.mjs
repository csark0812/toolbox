import assert from 'node:assert/strict'
import { test } from 'node:test'
import { formatSrt, formatTime, parseSrt, shift } from '../src/srt.mjs'
import { importUpload } from '../src/upload.mjs'

const sample =
  '1\n00:00:01,000 --> 00:00:02,500\nHello.\n\n2\n00:00:03,000 --> 00:00:04,000\nTwo\nlines\n'

test('parses cues', () => {
  assert.deepEqual(parseSrt(sample), [
    { start: 1000, end: 2500, text: 'Hello.' },
    { start: 3000, end: 4000, text: 'Two\nlines' },
  ])
})

test('parses Windows line endings', () => {
  assert.equal(parseSrt(sample.replace(/\n/g, '\r\n')).length, 2)
})

test('formats times', () => {
  assert.equal(formatTime(3723004), '01:02:03,004')
})

test('shifts and round-trips', () => {
  assert.equal(
    formatSrt(shift(parseSrt(sample), 500)),
    '1\n00:00:01,500 --> 00:00:03,000\nHello.\n\n2\n00:00:03,500 --> 00:00:04,500\nTwo\nlines\n',
  )
})

test('imports an upload', () => {
  assert.equal(importUpload(Buffer.from(sample)).count, 2)
})
