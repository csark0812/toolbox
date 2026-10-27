import assert from 'node:assert/strict'
import { test } from 'node:test'
import { bookingsFor, loadHuts } from '../src/huts.mjs'

test("a hut's bookings come earliest first", () => {
  const season = loadHuts()
  assert.deepEqual(
    bookingsFor(season, 1).map((booking) => booking.family),
    ['Patel', 'Okafor'],
  )
  assert.deepEqual(bookingsFor(season, 9), [])
})
