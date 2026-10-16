import assert from 'node:assert/strict'
import { test } from 'node:test'
import { overLimit, speakers, toCsv, wordCount } from '../src/talks.mjs'

const talk = (id, abstract, email = `s${id}@example.org`) => ({
  id,
  title: `Talk ${id}`,
  track: 'UX',
  speaker: { name: `Speaker ${id}`, email },
  abstract,
})

test('counts words', () => {
  assert.equal(wordCount('one two three'), 3)
})

test('flags long abstracts', () => {
  const long = Array.from({ length: 121 }, () => 'word').join(' ')
  assert.deepEqual(
    overLimit([talk(1, 'short'), talk(2, long)]).map((t) => [t.id, t.words]),
    [[2, 121]],
  )
})

test('exports CSV', () => {
  assert.equal(
    toCsv([talk(1, 'a b')]),
    'id,title,track,speaker,email,words\n1,Talk 1,UX,Speaker 1,s1@example.org,2',
  )
})

test('lists each speaker once', () => {
  assert.deepEqual(
    speakers([talk(1, 'a', 'x@example.org'), talk(2, 'b', 'x@example.org')]).map(
      (s) => s.proposals,
    ),
    [2],
  )
})
