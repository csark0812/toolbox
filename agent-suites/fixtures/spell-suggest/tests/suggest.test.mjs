import assert from 'node:assert/strict'
import { test } from 'node:test'
import { editDistance } from '../src/distance.mjs'
import { suggest } from '../src/suggest.mjs'

const dictionary = [
  { word: 'choir', frequency: 40 },
  { word: 'chair', frequency: 90 },
  { word: 'chore', frequency: 5 },
  { word: 'cheer', frequency: 12 },
  { word: 'organ', frequency: 30 },
]
const words = (list) => list.map((entry) => entry.word)

test('edit distance counts single-letter edits', () => {
  assert.equal(editDistance('kitten', 'sitting'), 3)
  assert.equal(editDistance('', 'abc'), 3)
  assert.equal(editDistance('same', 'same'), 0)
})

test('closest first, then more frequent', () => {
  assert.deepEqual(words(suggest(dictionary, 'choor')), ['choir', 'chair', 'cheer', 'chore'])
})

test('ignores case', () => {
  assert.deepEqual(words(suggest(dictionary, 'CHOIR', { limit: 1 })), ['choir'])
})

test('nothing beyond the maximum distance', () => {
  assert.deepEqual(suggest(dictionary, 'zzzzz'), [])
  assert.deepEqual(words(suggest(dictionary, 'orgn', { maxDistance: 1 })), ['organ'])
})
