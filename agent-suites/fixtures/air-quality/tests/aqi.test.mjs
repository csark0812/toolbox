import assert from 'node:assert/strict'
import { test } from 'node:test'
import { aqiFromPm25, currentAqi, dailyAverage } from '../src/aqi.mjs'

const at = (minutes, pm25) => ({ at: new Date(Date.UTC(2026, 9, 15, 12, minutes)), pm25 })

test('index from concentration', () => {
  assert.deepEqual(aqiFromPm25(0), { index: 0, category: 'Good' })
  assert.deepEqual(aqiFromPm25(9), { index: 50, category: 'Good' })
  assert.deepEqual(aqiFromPm25(35.4), { index: 100, category: 'Moderate' })
  assert.equal(aqiFromPm25(150).category, 'Very unhealthy')
})

test('one bad reading does not set off the alarm', () => {
  const readings = [at(0, 5), at(10, 6), at(20, 300), at(30, 5), at(40, 7)]
  assert.equal(currentAqi(readings, new Date(Date.UTC(2026, 9, 15, 12, 40))).category, 'Good')
})

test('no recent readings', () => {
  assert.equal(currentAqi([at(0, 5)], new Date(Date.UTC(2026, 9, 16))), null)
})

test('daily average', () => {
  assert.equal(dailyAverage([at(0, 4), at(10, 6)], '2026-10-15').pm25, 5)
})
