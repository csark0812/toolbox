import assert from 'node:assert/strict'
import { test } from 'node:test'
import { bookingLine } from '../src/bookings.mjs'

test('a booking shows its id, the name, the days and the kit', () => {
  assert.equal(
    bookingLine({ id: 'H201', name: 'Ruth Abbott', days: 6, kit: ['skis', 'boots', 'poles'] }),
    'H201  Ruth Abbott     6d  skis, boots, poles',
  )
})
