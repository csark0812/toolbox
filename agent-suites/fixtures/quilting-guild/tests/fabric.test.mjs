import assert from 'node:assert/strict'
import { test } from 'node:test'
import { calc_backing, calc_batting, calc_binding } from '../src/fabric.mjs'
import { backingOrder } from '../src/order.mjs'

const throwQuilt = { name: 'Throw', width: 60, length: 72 }

test('backing is seamed from 40-inch widths and rounded up to the quarter yard', () => {
  assert.equal(calc_backing(throwQuilt), 4.5)
})

test('batting takes a second length when the quilt is wider than the roll', () => {
  assert.equal(calc_batting(throwQuilt), 2.25)
  assert.equal(calc_batting({ name: 'King', width: 104, length: 98 }), 6)
})

test('binding is the perimeter plus 10 inches', () => {
  assert.equal(calc_binding(throwQuilt), 274)
})

test('the shop order adds up the backing', () => {
  assert.equal(backingOrder([throwQuilt, throwQuilt]), 9)
})
