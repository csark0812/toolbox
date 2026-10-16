import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { lineCost, recipeCost } from '../src/costing.mjs'

const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))
const prices = read('prices.json')
const soup = read('recipes.json').find((r) => r.name === 'leek and potato soup')

test('a line costs its amount at the unit price', () => {
  assert.equal(lineCost({ item: 'eggs', amount: 4 }, prices), 124)
  assert.throws(() => lineCost({ item: 'saffron', amount: 1 }, prices), RangeError)
})

test('the soup costs £4.31 to make', () => {
  assert.equal(recipeCost(soup, prices), 431)
})
