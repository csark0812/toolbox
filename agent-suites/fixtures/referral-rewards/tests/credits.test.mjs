import assert from 'node:assert/strict'
import { test } from 'node:test'
import { addCredit, balance, resetCredits } from '../src/credits.mjs'
import { countReferrals, createUser, getUser, recordReferral, reset } from '../src/db.mjs'

test('credits add up', async () => {
  resetCredits()
  await addCredit('u1', 500)
  await addCredit('u1', 250)
  assert.equal(balance('u1'), 750)
  await assert.rejects(addCredit('u1', 0), RangeError)
})

test('users and referrals', async () => {
  reset()
  await createUser({ id: 'u1', email: 'ana@example.org', name: 'Ana' })
  assert.equal((await getUser('u1')).name, 'Ana')
  await recordReferral('u1', 'u2')
  assert.equal(await countReferrals('u1'), 1)
})
