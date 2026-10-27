import assert from 'node:assert/strict'
import { test } from 'node:test'
import { holdsAt } from '../src/holds.mjs'
import {
  describeStop,
  minutesToClock,
  nextVisit,
  printRun,
  routeFor,
  runSheet,
  stopById,
  weekOf,
} from '../src/library.mjs'

test('weeks alternate A and B', () => {
  assert.equal(weekOf('2026-10-19'), 'B')
  assert.equal(weekOf('2026-10-26'), 'A')
})

test("a route keeps the every-week stops and that week's own", () => {
  assert.deepEqual(
    routeFor('Mon', 'A').map((stop) => stop.id),
    ['ST01', 'ST02', 'ST04'],
  )
  assert.deepEqual(
    routeFor('Mon', 'B').map((stop) => stop.id),
    ['ST01', 'ST03', 'ST04'],
  )
})

test('next visit skips the other week', () => {
  assert.equal(nextVisit(stopById('ST02'), '2026-10-19'), 'Mon 2026-10-26 at 10:35')
})

test('the run sheet has drive times and holds', () => {
  const rows = runSheet('Tue', 'A')
  assert.deepEqual(
    rows.map((row) => row.drive),
    [null, 25, 15],
  )
  assert.equal(rows[2].holds, 2)
  assert.equal(minutesToClock(rows[2].leave), '11:40')
})

test('holds are oldest first', () => {
  assert.deepEqual(
    holdsAt('ST07').map((hold) => hold.id),
    ['H301', 'H304'],
  )
})

test('a stop description', () => {
  assert.match(describeStop('ST12', '2026-10-21'), /Next visit Fri 2026-10-23 at 14:00/)
})

test('formats load on demand', async () => {
  assert.match(await printRun('Thu', 'B', 'csv'), /^stop,village/)
  await assert.rejects(printRun('Thu', 'B', 'pdf'), /No format pdf/)
})
