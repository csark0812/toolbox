import assert from 'node:assert/strict'
import { test } from 'node:test'
import { book } from '../src/booking.mjs'
import { quoteFare } from '../src/fares.mjs'
import { SailingStore } from '../src/store.mjs'

const sailing = (carSpaces = 2, seats = 6) => ({
  id: 'S1',
  label: 'S1',
  carSpaces,
  seats,
  cars: 0,
  passengers: 0,
})

test('car fares charge for extra passengers', async () => {
  assert.equal(await quoteFare({ vehicle: 'car', passengers: 3 }), 5000)
  assert.equal(await quoteFare({ vehicle: 'foot', passengers: 2 }), 1900)
})

test('a booking takes a car space and seats', async () => {
  const store = new SailingStore([sailing()])
  const result = await book(store, { ref: 'A', sailing: 'S1', vehicle: 'car', passengers: 2 })
  assert.deepEqual(result, { ref: 'A', ok: true, fare: 4400 })
  const row = await store.get('S1')
  assert.deepEqual([row.cars, row.passengers], [1, 2])
})

test('a booking that does not fit is refused', async () => {
  const store = new SailingStore([sailing(1)])
  await book(store, { ref: 'A', sailing: 'S1', vehicle: 'car', passengers: 1 })
  const result = await book(store, { ref: 'B', sailing: 'S1', vehicle: 'car', passengers: 1 })
  assert.equal(result.ok, false)
  assert.equal((await store.get('S1')).cars, 1)
})

test('an unknown sailing is an error', async () => {
  const store = new SailingStore([sailing()])
  await assert.rejects(
    book(store, { ref: 'A', sailing: 'S9', vehicle: 'foot', passengers: 1 }),
    RangeError,
  )
})
