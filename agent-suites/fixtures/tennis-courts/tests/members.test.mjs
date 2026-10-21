import assert from 'node:assert/strict'
import { test } from 'node:test'
import { loadMembers } from '../src/members.mjs'

test('reads the office export, Windows line endings and all', () => {
  const members = loadMembers('code,name,expires\r\nM1001,Priya Shah,2027-03-31\r\n')
  assert.deepEqual(members.get('M1001'), { name: 'Priya Shah', expires: '2027-03-31' })
})
