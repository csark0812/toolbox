import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createPost, createStore, publish } from '../src/posts.mjs'

test('creates drafts with increasing ids', () => {
  const store = createStore()
  assert.equal(createPost(store, { title: ' First ' }).title, 'First')
  assert.equal(createPost(store, { title: 'Second' }).id, 2)
  assert.equal(store.posts[0].status, 'draft')
})

test('requires a title', () => {
  assert.throws(() => createPost(createStore(), { title: '  ' }), TypeError)
})

test('publishes', () => {
  const store = createStore()
  const { id } = createPost(store, { title: 'Hi' })
  assert.equal(publish(store, id).status, 'published')
})
