import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mailbox, mailOut, mergeSubscribers } from '../src/merge.mjs'

test('gmail dots, plus tags and googlemail reach the same mailbox', () => {
  assert.equal(mailbox(' Ann.Lund+walks@GoogleMail.com '), 'annlund@gmail.com')
  assert.equal(mailbox('ann.lund+walks@outlook.com'), 'ann.lund+walks@outlook.com')
  assert.equal(mailbox('not an address'), null)
})

test('rows for one mailbox merge in first-seen order', () => {
  const list = mergeSubscribers([
    { email: 'Ann.Lund@gmail.com', name: '', tags: ['walks'], joined: '2022-01-01' },
    { email: 'dev@outlook.com', name: 'Dev', tags: [], joined: '2021-01-01' },
    {
      email: 'annlund@googlemail.com',
      name: 'Ann  Lund',
      tags: ['Walks', 'history'],
      joined: '2020-05-05',
    },
  ])
  assert.deepEqual(
    list.map((entry) => [entry.email, entry.name, entry.tags, entry.joined, entry.rows]),
    [
      ['Ann.Lund@gmail.com', 'Ann Lund', ['walks', 'history'], '2020-05-05', 2],
      ['dev@outlook.com', 'Dev', [], '2021-01-01', 1],
    ],
  )
})

test('an unsubscribe on any row sticks, and unusable rows are kept but not mailed', () => {
  const list = mergeSubscribers([
    { email: 'pete@stonebridge.org.uk', name: 'Pete' },
    { email: 'PETE@stonebridge.org.uk', unsubscribed: true },
    { email: 'ruth at the post office', name: 'Ruth' },
    { email: 'ruth at the post office', name: 'Ruth' },
  ])
  assert.deepEqual(
    list.map((entry) => [entry.unsubscribed, entry.valid]),
    [
      [true, true],
      [false, false],
      [false, false],
    ],
  )
  assert.deepEqual(mailOut(list), [])
})
