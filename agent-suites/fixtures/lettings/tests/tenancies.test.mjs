import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { route } from '../src/api.mjs'
import { reset } from '../src/store.mjs'

beforeEach(reset)

test('a landlord lists only their own tenancies', () => {
  const response = route('GET', '/tenancies', {}, { landlordId: 'll-1' })
  assert.equal(response.status, 200)
  assert.deepEqual(
    response.body.map((tenancy) => tenancy.id),
    ['t-1', 't-2'],
  )
})

test('tenancies need a session', () => {
  assert.equal(route('GET', '/tenancies', {}, null).status, 401)
})

test('a tenant sees their tenancy page', () => {
  const response = route('GET', '/portal/tenancy', {}, { tenancyId: 't-1' })
  assert.equal(response.status, 200)
  assert.match(response.body, /Deposit held: £1,200\.00/)
})
