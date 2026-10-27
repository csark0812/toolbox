import assert from 'node:assert/strict'
import test from 'node:test'
import { dailyHay, feedCost, feedPlan, hardFeedKg } from '../src/feeds.mjs'
import { loadHorses } from '../src/horses.mjs'

const horses = loadHorses()
const byName = (name) => horses.find((h) => h.name === name)

test('hay rounds to the half kilo', () => {
  assert.equal(dailyHay(byName('Bramble')), 11.5)
  assert.equal(dailyHay(byName('Pickle')), 6)
  assert.throws(() => dailyHay({ weightKg: 500, workload: 'show' }), /Unknown workload/)
})

test('hard feed', () => {
  assert.equal(hardFeedKg(byName('Duke')), 2)
  assert.equal(hardFeedKg(byName('Moss')), 0)
})

test('DIY hay is not charged', () => {
  assert.equal(feedCost(byName('Tilly')), 385)
})

test('the plan goes in box order', () => {
  assert.deepEqual(
    feedPlan(horses).map((row) => row.box),
    [2, 4, 7, 9, 11, 15],
  )
})
