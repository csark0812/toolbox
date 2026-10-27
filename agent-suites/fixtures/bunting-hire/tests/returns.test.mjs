import assert from 'node:assert/strict'
import { test } from 'node:test'
import { returnLine } from '../src/returns.mjs'

const hire = {
  ref: 'H-1',
  hirer: 'A. Hirer',
  item: 'gazebo',
  due: '2026-06-14',
  returned: '2026-06-14',
  deposit: 2000,
}

test('a returns line names the hire, the hirer and the dates', () => {
  assert.equal(returnLine(hire), 'H-1  A. Hirer  gazebo  due 2026-06-14  back 2026-06-14')
})
