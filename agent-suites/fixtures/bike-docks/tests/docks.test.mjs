import assert from 'node:assert/strict'
import { test } from 'node:test'
import { formatRow, freeSpaces, statusRows } from '../src/docks.mjs'

const dock = (name, states, capacity = 10) => ({
  name,
  capacity,
  bikes: states.map((state, i) => ({ id: `${name}${i}`, state })),
})

test('broken bikes are not available', () => {
  assert.equal(statusRows([dock('A', ['ok', 'broken', 'ok'])])[0].bikes, 2)
})

test('free spaces count every docked bike', () => {
  assert.equal(freeSpaces(dock('A', ['ok', 'broken'], 4)), 2)
})

test('formats a row', () => {
  assert.equal(
    formatRow({ name: 'Abbey Gardens', bikes: 1, spaces: 6 }),
    'Abbey Gardens         1 bike, 6 spaces',
  )
})
