import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { route } from '../src/api.mjs'
import { reset } from '../src/store.mjs'

beforeEach(reset)
const rhys = { customerId: 'c-1' }

test('a customer lists their own hires, newest first', async () => {
  const response = await route('GET', '/hires', {}, rhys)
  assert.equal(response.status, 200)
  assert.deepEqual(
    response.body.map((hire) => hire.id),
    ['h-201', 'h-198'],
  )
})

test("a customer cannot see someone else's hire", async () => {
  assert.equal((await route('GET', '/hires/h-202', {}, rhys)).status, 404)
})

test('hires need a session', async () => {
  assert.equal((await route('GET', '/hires', {}, null)).status, 401)
})
