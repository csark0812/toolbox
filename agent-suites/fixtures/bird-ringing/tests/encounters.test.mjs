import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { addEncounter, historyOf } from '../src/encounters.mjs'
import { birds, reset } from '../src/store.mjs'

beforeEach(reset)
const catchOf = (fields) => ({ site: 's-1', ringer: 'AK', wingMm: 66, weightG: 11.0, ...fields })

test('a ring we have not seen before is a newly ringed bird', () => {
  addEncounter(
    catchOf({ ring: 'D490001', species: 'Sedge Warbler', date: '2026-10-11', time: '07:00' }),
  )
  assert.deepEqual(
    birds().find((bird) => bird.ring === 'D490001'),
    { ring: 'D490001', species: 'Sedge Warbler', ringedOn: '2026-10-11' },
  )
})

test('a bird caught twice in one day keeps both encounters', () => {
  addEncounter(
    catchOf({ ring: 'D483377', species: 'Sedge Warbler', date: '2026-10-11', time: '07:00' }),
  )
  addEncounter(
    catchOf({ ring: 'D483377', species: 'Sedge Warbler', date: '2026-10-11', time: '10:30' }),
  )
  assert.deepEqual(
    historyOf('D483377').map((entry) => `${entry.date} ${entry.time}`),
    ['2026-08-02 06:45', '2026-10-11 07:00', '2026-10-11 10:30'],
  )
})

test('a ring cannot change species', () => {
  assert.throws(
    () =>
      addEncounter(
        catchOf({ ring: 'Z71204', species: 'Reed Warbler', date: '2026-10-11', time: '07:00' }),
      ),
    /Z71204 is a Blue Tit/,
  )
})
