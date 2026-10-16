import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildSite } from '../src/build.mjs'
import { renderPost } from '../src/render.mjs'

const post = {
  slug: 'hello',
  title: 'Hello & welcome',
  date: '2026-10-01',
  author: 'Priya',
  tags: ['news', 'c++'],
  body: 'First paragraph.\n\nSecond <one>.',
}

test('renders a post', () => {
  const html = renderPost(post)
  assert.match(html, /<h1>Hello &amp; welcome<\/h1>/)
  assert.match(html, /<a class="tag" href="\/tags\/c%2B%2B.html">#c\+\+<\/a>/)
  assert.match(html, /<p>Second &lt;one&gt;.<\/p>/)
})

test('builds the index newest first', () => {
  const files = buildSite([post, { ...post, slug: 'later', date: '2026-10-05' }])
  assert.deepEqual(
    files.map(([path]) => path),
    ['index.html', 'later.html', 'hello.html'],
  )
})
