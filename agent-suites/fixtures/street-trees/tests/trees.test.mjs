import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fencingList, latestSurvey, parseSurveys } from '../src/trees.mjs'

const surveys = parseSurveys(`tree,date,condition,via
T-1,2026-03-10,SOUND,office
T-1,2026-08-04,DANGER,office
T-2,2026-03-10,DANGER,office
T-2,2026-09-22,SOUND,office`)

test('the latest survey wins', () => {
  assert.equal(latestSurvey(surveys.filter((s) => s.tree === 'T-1')).date, '2026-08-04')
  assert.equal(latestSurvey(surveys.filter((s) => s.tree === 'T-2')).condition, 'SOUND')
})

test('a tree rated DANGER is fenced until a later survey clears it', () => {
  const list = fencingList([{ tree: 'T-1' }, { tree: 'T-2' }], surveys)
  assert.deepEqual(
    list.map((row) => [row.tree, row.fence]),
    [
      ['T-1', true],
      ['T-2', false],
    ],
  )
})

test('a tree never surveyed is not fenced', () => {
  const [row] = fencingList([{ tree: 'T-9' }], surveys)
  assert.equal(row.latest, undefined)
  assert.equal(row.fence, false)
})
