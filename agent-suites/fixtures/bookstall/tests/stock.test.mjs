import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { findBook, price } from '../src/stock.mjs'

const stock = JSON.parse(readFileSync(new URL('../data/stock.json', import.meta.url), 'utf8'))

test('finds a book by its ISBN', () => {
  assert.equal(findBook(stock, '9780140449136').shelf, 'C2')
})

test('an unknown ISBN finds nothing', () => {
  assert.equal(findBook(stock, '9780000000002'), undefined)
})

test('prices in pounds', () => {
  assert.equal(price(350), '£3.50')
})
