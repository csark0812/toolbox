import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { createRouter } from '../src/router.mjs'

const routes = JSON.parse(readFileSync(new URL('../routes.json', import.meta.url), 'utf8'))
const { match } = createRouter(routes)

test('matches literal routes and the root', () => {
  assert.deepEqual(match('GET', '/'), { name: 'home', params: {} })
  assert.deepEqual(match('GET', '/products'), { name: 'listProducts', params: {} })
  assert.deepEqual(match('POST', '/products'), { name: 'createProduct', params: {} })
})

test('captures and decodes params', () => {
  assert.deepEqual(match('GET', '/shops/north%20side/orders/42'), {
    name: 'showOrder',
    params: { shopId: 'north side', orderId: '42' },
  })
})

test('a literal beats a param', () => {
  assert.equal(match('GET', '/products/featured').name, 'featuredProducts')
  assert.equal(match('GET', '/products/7').name, 'showProduct')
})

test('ignores the query string and one trailing slash', () => {
  assert.equal(match('GET', '/products/7/?ref=mail').name, 'showProduct')
})

test('wildcards take the rest of the path', () => {
  assert.deepEqual(match('GET', '/static/css/site.css'), {
    name: 'staticFile',
    params: { '*': 'css/site.css' },
  })
  assert.equal(match('GET', '/static'), null)
})

test('HEAD uses GET routes and * takes any method', () => {
  assert.equal(match('HEAD', '/products').name, 'listProducts')
  assert.equal(match('DELETE', '/health').name, 'health')
  assert.equal(match('DELETE', '/products'), null)
})

test('a param that cannot be decoded does not match', () => {
  assert.equal(match('GET', '/products/%E0%A4%A'), null)
})
