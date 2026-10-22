import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { daysToGo, fill, longDate, show } from '../src/show.mjs'
import { renderWeb } from '../src/web.mjs'

test('the countdown counts whole days left before the show', () => {
  assert.equal(daysToGo('2027-03-01'), 12)
  assert.equal(daysToGo(show.date), 0)
})

test('dates are written out in full', () => {
  assert.equal(longDate('2027-02-13'), 'Saturday 13 February 2027')
})

test('the ticket is filled in', () => {
  assert.equal(
    fill('Admit {name} ({band}) {other}', { name: 'Ann', band: 'Adult' }),
    'Admit Ann (Adult) {other}',
  )
})

test('the built web page is up to date with its template', () => {
  assert.equal(readFileSync(new URL('../web/index.html', import.meta.url), 'utf8'), renderWeb())
})
