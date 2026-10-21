import assert from 'node:assert/strict'
import { test } from 'node:test'
import { loadLoans, loansFor } from '../src/loans.mjs'

test("a member's loans are found by name", () => {
  const loans = loadLoans()
  assert.deepEqual(
    loansFor(loans, 'Dev Rao').map((loan) => loan.title),
    ['Dune'],
  )
  assert.deepEqual(loansFor(loans, 'Nobody'), [])
})
