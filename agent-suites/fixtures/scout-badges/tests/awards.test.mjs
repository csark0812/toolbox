import assert from 'node:assert/strict'
import { test } from 'node:test'
import { awardsFor, highestStages, loadAwards } from '../src/awards.mjs'
import { censusCsv } from '../src/census.mjs'
import { forSection } from '../src/sections.mjs'

const awards = loadAwards(
  JSON.stringify([
    { bc: 'NAV', nm: 'Navigator', lvl: 2, scout: 'S1', at: '2026-03-12' },
    { bc: 'NAV', nm: 'Navigator', lvl: '3', scout: 'S1', at: '2026-09-24' },
    { bc: 'SWM', nm: 'Swimmer', lvl: 3, scout: 'S1', at: '2026-05-07' },
    { bc: 'NAV', nm: 'Navigator', lvl: 1, scout: 'S2', at: '2026-04-16' },
  ]),
)

test('a scout sees their highest stages first, then badges by name', () => {
  assert.deepEqual(
    awardsFor(awards, 'S1').map((award) => `${award.bc}-${award.lvl}`),
    ['NAV-3', 'SWM-3', 'NAV-2'],
  )
})

test('the highest stage of a badge per scout', () => {
  assert.deepEqual(
    [...highestStages(awards, 'NAV')],
    [
      ['S1', 3],
      ['S2', 1],
    ],
  )
})

test('a section presents only its stages', () => {
  assert.equal(forSection(awards, { field: 'lvl', from: 1, to: 2 }).length, 2)
})

test('the census has a heading row and a row per award', () => {
  assert.equal(censusCsv(awards).split('\n')[1], 'NAV,Navigator,2,S1,2026-03-12')
})
