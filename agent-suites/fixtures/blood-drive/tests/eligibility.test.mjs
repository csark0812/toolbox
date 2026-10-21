import assert from 'node:assert/strict'
import { test } from 'node:test'
import { dueOn, parseHistory } from '../src/eligibility.mjs'

const history = parseHistory(
  'donor,date,outcome,site\nA,2026-09-01,donated,main\nB,2026-08-11,donated,main\n',
)

test('a donor is due 84 days after their last donation', () => {
  assert.deepEqual(dueOn(history, 'A', '2026-11-24'), {
    due: true,
    last: '2026-09-01',
    from: '2026-11-24',
  })
  assert.equal(dueOn(history, 'A', '2026-11-23').due, false)
})

test('the 84th day counts in whole days, whatever the clocks do', () => {
  assert.equal(dueOn(history, 'B', '2026-11-03').due, true)
})

test('a first-time donor is due', () => {
  assert.deepEqual(dueOn(history, 'Z', '2026-11-03'), { due: true, last: null, from: null })
})
