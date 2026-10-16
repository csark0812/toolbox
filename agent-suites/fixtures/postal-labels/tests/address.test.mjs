import assert from 'node:assert/strict'
import { test } from 'node:test'
import { formatAddress } from '../src/address.mjs'
import { formatFor } from '../src/presets.mjs'
import { manifest } from '../src/manifest.mjs'
import { render } from '../src/template.mjs'

const home = {
  name: 'Jonas Weber',
  line1: 'Kastanienallee 9',
  city: 'Berlin',
  postcode: '10435',
  country: 'Germany',
}

test('one line by default', () => {
  assert.equal(formatAddress(home), 'Jonas Weber, Kastanienallee 9, Berlin 10435')
})

test('one part per line, with the country, in capitals', () => {
  assert.equal(
    formatAddress(home, true, true, true),
    'JONAS WEBER\nKASTANIENALLEE 9\nBERLIN 10435\nGERMANY',
  )
})

test('presets', () => {
  assert.equal(formatFor('sms', home), 'Jonas Weber, Kastanienallee 9, Berlin 10435')
  assert.equal(formatFor('envelope', home), 'JONAS WEBER\nKASTANIENALLEE 9\nBERLIN 10435')
  assert.throws(() => formatFor('pigeon', home), RangeError)
})

test('manifest rows', () => {
  assert.equal(
    manifest([{ id: 'X1', parcels: 1, to: home }]).split('\n')[1],
    'X1,1,"Jonas Weber, Kastanienallee 9, Berlin 10435, Germany","Kiln & Clay, Unit 4, Mill Yard, Stroud GL5 3JH, United Kingdom"',
  )
})

test('templates format addresses with flags', () => {
  assert.equal(render('{{a|upper}}', { a: home }), 'JONAS WEBER, KASTANIENALLEE 9, BERLIN 10435')
  assert.equal(render('{{n}}', { n: 3 }), '3')
  assert.throws(() => render('{{a|bold}}', { a: home }), RangeError)
})
