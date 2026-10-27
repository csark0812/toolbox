import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { route } from '../src/api.mjs'
import { reset } from '../src/store.mjs'

beforeEach(reset)
const grace = { artistId: 'a-4' }

test('only approved artists are on the public trail', () => {
  const response = route('GET', '/artists')
  assert.equal(response.status, 200)
  assert.deepEqual(
    response.body.map((artist) => artist.id),
    ['a-1', 'a-4', 'a-3'],
  )
})

test('a public listing never shows email or phone', () => {
  for (const artist of route('GET', '/artists').body) {
    assert.equal(artist.email, undefined)
    assert.equal(artist.phone, undefined)
  }
})

test('a listing shows its photos', () => {
  const tomasz = route('GET', '/artists').body.find((artist) => artist.id === 'a-3')
  assert.deepEqual(tomasz.photos, ['photos/a-3/cover.jpg', 'photos/a-3/kiln.jpg'])
})

test('an artist changes only the editable fields of their own listing', () => {
  const body = { bio: 'Fused glass and lampwork.', approved: true, name: 'Someone Else' }
  const response = route('PATCH', '/me', { body }, grace)
  assert.equal(response.status, 200)
  assert.equal(response.body.bio, 'Fused glass and lampwork.')
  assert.equal(response.body.name, 'Grace Lee')
})

test('changing a listing needs a session', () => {
  assert.equal(route('PATCH', '/me', { body: { bio: 'x' } }).status, 401)
})
