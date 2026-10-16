import assert from 'node:assert/strict'
import { test } from 'node:test'
import { chapterStats, countSentences, countWords, readingMinutes } from '../src/count.mjs'

test('counts words', () => {
  assert.equal(countWords('The market opens at six.'), 5)
  assert.equal(countWords('  spaced   out\nover lines '), 4)
})

test('a contraction is one word', () => {
  assert.equal(countWords("We didn't believe her brother's story."), 6)
})

test('numbers are words', () => {
  assert.equal(countWords('In 1987 jars'), 3)
})

test('counts sentences', () => {
  assert.equal(countSentences('One. Two! Three? Four...'), 4)
})

test('reading time rounds up', () => {
  assert.equal(readingMinutes(0), 0)
  assert.equal(readingMinutes(230), 1)
  assert.equal(readingMinutes(231), 2)
})

test('chapter headings count as words', () => {
  assert.deepEqual(chapterStats('# Market Day\n\nWe went early.\n'), {
    words: 5,
    sentences: 1,
    minutes: 1,
  })
})
