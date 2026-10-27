import assert from 'node:assert/strict'
import { test } from 'node:test'
import { swimmerLine } from '../src/swimmers.mjs'

test('a swimmer shows their name and date of birth', () => {
  assert.equal(
    swimmerLine({ name: 'Ava Brook', born: '2013-08-20', times: {} }),
    'Ava Brook    2013-08-20',
  )
})
