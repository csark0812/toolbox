import assert from 'node:assert/strict'
import { test } from 'node:test'
import { hasValidCheck, sessionProblems } from '../src/rota.mjs'

const volunteers = [
  { name: 'Ada', dbs_issued: '2024-05-01', update_service: 'no', update_until: '' },
  { name: 'Ben', dbs_issued: '2022-01-15', update_service: 'no', update_until: '' },
  { name: 'Cal', dbs_issued: '2018-02-01', update_service: 'yes', update_until: '2027-01-31' },
]

test('a check lasts three years from its issue date', () => {
  assert.equal(hasValidCheck(volunteers[0], '2026-10-27'), true)
  assert.equal(hasValidCheck(volunteers[1], '2026-10-27'), false)
})

test('the Update Service keeps an old certificate valid', () => {
  assert.equal(hasValidCheck(volunteers[2], '2026-10-27'), true)
})

test('a session led by someone without a valid check is flagged', () => {
  const session = { date: '2026-10-27', lead: 'Ben', helpers: 'Ada' }
  assert.deepEqual(sessionProblems(session, volunteers), ['Ben has no valid DBS check'])
})

test('a session with only one adult is flagged', () => {
  const session = { date: '2026-10-27', lead: 'Ada', helpers: '' }
  assert.deepEqual(sessionProblems(session, volunteers), ['only one adult'])
})
