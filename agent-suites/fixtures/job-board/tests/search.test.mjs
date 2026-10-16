import assert from 'node:assert/strict'
import { test } from 'node:test'
import { distanceKm, relevance, search } from '../src/search.mjs'

const cities = { A: [53.8, -1.55], B: [53.96, -1.08], C: [51.5, -0.13] }
const job = (id, title, place) => ({
  id,
  title,
  company: 'x',
  tags: [],
  description: '',
  ...(place ? { city: place } : { remote: true }),
})

test('distance between cities', () => {
  assert.equal(Math.round(distanceKm(cities.A, cities.B)), 36)
})

test('title matches count most', () => {
  assert.equal(
    relevance({ title: 'Designer', tags: ['design'], description: 'design' }, ['design']),
    6,
  )
})

test('nearest first', () => {
  const jobs = [job('far', 'Designer', 'C'), job('near', 'Designer', 'B')]
  assert.deepEqual(
    search(jobs, 'designer', { near: 'A', cities }).map((j) => j.id),
    ['near', 'far'],
  )
})

test('an unknown home city is an error', () => {
  assert.throws(() => search([], 'x', { near: 'Z', cities }), RangeError)
})
