import assert from 'node:assert/strict'
import { test } from 'node:test'
import { barList, programme } from '../src/casks.mjs'

const casks = [
  { beer: 'Low Tide', brewery: 'Beacon Ales', abv: 3.9, bar: 'Cellar', style: 'Golden ale' },
  { beer: 'Harbour Mild', brewery: 'Tidal Brewing', abv: 3.6, bar: 'Quay', style: 'Mild' },
]

test('the bar list is in beer order with the strength', () => {
  assert.deepEqual(barList(casks), [
    'Harbour Mild          Tidal Brewing     3.6%',
    'Low Tide              Beacon Ales       3.9%',
  ])
})

test('the programme is by brewery', () => {
  assert.deepEqual(programme(casks), [
    'Beacon Ales: Low Tide, golden ale, 3.9%',
    'Tidal Brewing: Harbour Mild, mild, 3.6%',
  ])
})
