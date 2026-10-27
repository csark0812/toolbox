import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { route } from '../src/api.mjs'
import { reset } from '../src/store.mjs'

beforeEach(reset)
const passenger = { passengerId: 'pa-1' }
const desk = { staffId: 'st-1' }

test('passengers see only the public details', () => {
  const response = route('GET', '/items', { query: { q: 'laptop' } }, passenger)
  assert.equal(response.status, 200)
  assert.deepEqual(response.body, [
    { id: 'it-3', title: 'Silver laptop', category: 'electronics', foundOn: '2026-10-12' },
  ])
})

test('an item is gone from day 29', () => {
  const search = (today) =>
    route('GET', '/items', { query: { q: 'rucksack' }, today }, passenger).body.length
  assert.equal(search('2026-10-17'), 1)
  assert.equal(search('2026-10-18'), 0)
})

test('a claim waits for staff to check it', () => {
  const claim = route(
    'POST',
    '/items/it-1/claims',
    { body: { description: 'black umbrella' } },
    passenger,
  )
  assert.equal(claim.status, 201)
  assert.equal(claim.body.status, 'pending')
  const release = route('POST', `/claims/${claim.body.id}/release`, {}, desk)
  assert.equal(release.status, 200)
})

test('a released item cannot be claimed', () => {
  const claim = route('POST', '/items/it-4/claims', { body: { description: 'wallet' } }, passenger)
  assert.equal(claim.status, 404)
})
