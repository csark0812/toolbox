import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isAllowed } from '../src/hosts.mjs'
import { handleImage } from '../src/proxy.mjs'

test('only allows our CDN hosts over https', () => {
  assert.equal(isAllowed('https://cdn.shopfront.example/p/1.jpg'), true)
  assert.equal(isAllowed('http://cdn.shopfront.example/p/1.jpg'), false)
  assert.equal(isAllowed('https://evil.example/p/1.jpg'), false)
  assert.equal(isAllowed('not a url'), false)
})

test('proxies an allowed image', async () => {
  const fetched = []
  const fetchImage = async (url) => (fetched.push(url), Buffer.from('jpeg'))
  const res = await handleImage(
    { url: '/img?url=https://cdn.shopfront.example/p/1.jpg' },
    { fetchImage },
  )
  assert.equal(res.status, 200)
  assert.deepEqual(fetched, ['https://cdn.shopfront.example/p/1.jpg'])
})

test('refuses other hosts', async () => {
  const res = await handleImage(
    { url: '/img?url=https://evil.example/x.jpg' },
    { fetchImage: async () => assert.fail() },
  )
  assert.equal(res.status, 400)
})
