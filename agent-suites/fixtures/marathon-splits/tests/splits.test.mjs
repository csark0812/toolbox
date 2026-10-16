import assert from 'node:assert/strict'
import { test } from 'node:test'
import { clock, pace, seconds } from '../src/clock.mjs'
import { chipTime, readMats } from '../src/splits.mjs'

test('clock times', () => {
  assert.equal(seconds('09:00:09'), 32409)
  assert.equal(clock(13258), '3:40:58')
})

test('pace rounds up to the next second', () => {
  assert.equal(pace(3150, 10), '5:15/km')
  assert.equal(pace(3151, 10), '5:16/km')
})

test('chip time runs from the start mat', () => {
  const mats = readMats('bib,mat,time\n1,start,09:00:30\n1,finish,12:00:00\n').get('1')
  assert.equal(clock(chipTime({}, mats)), '2:59:30')
})
