import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { checkin, checkout } from '../src/circulation.mjs'
import { reminderFor } from '../src/notify.mjs'
import { fineFor, sweep } from '../src/overdue.mjs'
import { report, statusCounts } from '../src/report.mjs'
import { loadLoans, saveLoans } from '../src/store.mjs'

const sample = () => loadLoans(new URL('../data/loans.json', import.meta.url))

test('reads legacy statuses', () => {
  const loans = sample()
  assert.equal(loans.find((l) => l.id === 'L3').status, 'overdue')
  assert.equal(loans.find((l) => l.id === 'L7').status, 'out')
})

test('sweeps overdue and lost loans', () => {
  const loans = sample()
  assert.deepEqual(sweep(loans, '2026-10-15'), ['L2', 'L4'])
  assert.deepEqual(statusCounts(loans), { out: 2, overdue: 2, lost: 2, returned: 1 })
})

test('fines', () => {
  const loans = sample()
  sweep(loans, '2026-10-15')
  const byId = Object.fromEntries(loans.map((l) => [l.id, l]))
  assert.equal(fineFor(byId.L2, '2026-10-15'), 350)
  assert.equal(fineFor(byId.L3, '2026-10-15'), 575)
  assert.equal(fineFor(byId.L4, '2026-10-15'), 3400)
  assert.equal(fineFor(byId.L1, '2026-10-15'), 0)
})

test('checkout and checkin', () => {
  const loans = sample()
  assert.throws(() => checkout(loans, { bookId: 'B-101', memberId: 'm9', today: '2026-10-15' }))
  const loan = checkout(loans, { bookId: 'B-118', memberId: 'm9', today: '2026-10-15' })
  assert.equal(loan.status, 'out')
  assert.equal(loan.dueOn, '2026-11-05')
  assert.equal(checkin(loans, loan.id, '2026-10-20').status, 'returned')
  assert.throws(() => checkin(loans, loan.id, '2026-10-21'))
})

test('reminders and report', () => {
  const loans = sample()
  sweep(loans, '2026-10-15')
  assert.match(reminderFor(loans[1]), /was due on 2026-10-01/)
  assert.equal(reminderFor(loans[0]), null)
  assert.match(report(loans, '2026-10-15'), /^On loan {3}2$/m)
})

test('saves loans as plain JSON', () => {
  const path = join(mkdtempSync(join(tmpdir(), 'loans-')), 'loans.json')
  saveLoans(path, sample().slice(0, 1))
  assert.equal(JSON.parse(readFileSync(path, 'utf8'))[0].status, 'out')
  writeFileSync(path, '[]')
})
