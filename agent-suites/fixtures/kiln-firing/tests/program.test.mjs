import assert from 'node:assert/strict'
import { test } from 'node:test'
import { calcHold, calcRamp, fmtMinutes } from '../src/helpers.mjs'
import { steps, totalMinutes } from '../src/program.mjs'

test('a ramp takes its distance over its rate, rounded up to a minute', () => {
  assert.equal(calcRamp({ to: 600, rate: 100 }, 100), 300)
  assert.equal(calcRamp({ to: 1222, rate: 60 }, 1160), 62)
  assert.equal(calcRamp({ to: 100, rate: 7 }, 20), 686)
})

test('a hold lasts its minutes', () => {
  assert.equal(calcHold({ minutes: 15 }), 15)
})

test('durations read as hours and minutes', () => {
  assert.equal(fmtMinutes(425), '7h 05m')
  assert.equal(fmtMinutes(0), '0h 00m')
})

test('steps carry the temperature forward', () => {
  const program = [
    { shape: 'ramp', to: 100, rate: 60 },
    { shape: 'hold', minutes: 30 },
    { shape: 'ramp', to: 50, rate: 100 },
  ]
  assert.deepEqual(
    steps(program).map((step) => [step.minutes, step.temperature]),
    [
      [80, 100],
      [30, 100],
      [30, 50],
    ],
  )
  assert.equal(totalMinutes(program), 140)
})

test('an unknown segment shape is refused', () => {
  assert.throws(() => steps([{ shape: 'cool', to: 20 }]), /cool/)
})
