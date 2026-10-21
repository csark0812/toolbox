import assert from 'node:assert/strict'
import { test } from 'node:test'
import { letter } from '../src/letters.mjs'
import { fill, reminder } from '../src/texts.mjs'

const patient = { id: 'p9', title: 'Mr', first: 'Sid', last: 'Moor' }
const appointment = { patient: 'p9', day: 'Monday 2 November', time: '10:00', kind: 'default' }

test('placeholders are filled and unknown ones are left alone', () => {
  assert.equal(fill('{a} and {b}', { a: 'x' }), 'x and {b}')
})

test('a reminder carries the clinic number', () => {
  const text = reminder({ default: 'Hi {name}, {day} {time}. Call {phone}.' }, appointment, patient)
  assert.equal(text, 'Hi Sid, Monday 2 November 10:00. Call 01632 960123.')
})

test('the letter is addressed and signed off', () => {
  const body = letter(patient, appointment)
  assert.match(body, /^Fernside Foot Clinic\n/)
  assert.match(body, /Dear Mr Moor,/)
  assert.match(body, /Tel: 01632 960 123/)
})
