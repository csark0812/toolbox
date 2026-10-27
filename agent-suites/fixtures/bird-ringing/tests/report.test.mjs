import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { publicReport } from '../src/report.mjs'
import { reset } from '../src/store.mjs'

beforeEach(reset)

test('the report has one line per encounter, oldest first', () => {
  const report = publicReport()
  assert.equal(report.length, 9)
  assert.equal(report[0], '2026-05-30 Blue Tit Z71204 Fen Lane hedge, Suffolk (TM 4702 9531)')
})

test('Schedule 1 species show only the county', () => {
  const kingfisher = publicReport().filter((line) => line.includes('SX4410'))
  assert.deepEqual(kingfisher, [
    '2026-08-23 Kingfisher SX4410 Norfolk',
    '2026-10-04 Kingfisher SX4410 Norfolk',
  ])
})
