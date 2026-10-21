import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fees, placings, prizes } from '../src/show.mjs'

const exhibitors = [
  { id: 'A', name: 'Ann', village: 'Ashby', age: 40, paid: true },
  { id: 'B', name: 'Bea', village: 'Ashby', age: 9, paid: false },
  { id: 'C', name: 'Cy', village: 'Crow End', age: 30, paid: false },
]
const entries = [
  { entry: 1, class: 1, exhibitor: 'A' },
  { entry: 2, class: 1, exhibitor: 'B' },
  { entry: 3, class: 1, exhibitor: 'C' },
]

test('the highest points win the class', () => {
  const scores = [
    { entry: 1, points: '12' },
    { entry: 2, points: '15' },
    { entry: 3, points: '11' },
  ]
  const [result] = placings([{ class: 1, title: 'Jam', section: 'Preserves' }], entries, scores)
  assert.deepEqual(
    result.placed.map((entry) => entry.exhibitor),
    ['B', 'A', 'C'],
  )
  assert.deepEqual(
    prizes([result], exhibitors).map((row) => [row.name, row.pence]),
    [
      ['Bea', 300],
      ['Ann', 200],
      ['Cy', 100],
    ],
  )
})

test('entries are 50p and young juniors enter free', () => {
  assert.deepEqual(
    fees(exhibitors, entries).map((row) => row.pence),
    [50, 0, 50],
  )
})
