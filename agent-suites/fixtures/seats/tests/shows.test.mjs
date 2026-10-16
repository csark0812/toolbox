import assert from 'node:assert/strict'
import { test } from 'node:test'
import { handle } from '../src/routes.mjs'
import { addShow } from '../src/shows.mjs'
import { createStore } from '../src/store.mjs'

test('lists the open seats of a show', async () => {
  const store = createStore()
  await addShow(store, { id: 'hamlet', title: 'Hamlet', priceCents: 4500, seats: ['A1', 'A2'] })
  await store.set('seat:hamlet:A1', { userId: 'u1' })
  assert.deepEqual((await handle(store, { method: 'GET', path: '/shows/hamlet/seats' })).body, [
    'A2',
  ])
  assert.equal((await handle(store, { method: 'GET', path: '/shows/nope/seats' })).status, 404)
})
