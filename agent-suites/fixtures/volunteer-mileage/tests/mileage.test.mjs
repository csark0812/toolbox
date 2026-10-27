import assert from 'node:assert/strict'
import { test } from 'node:test'
import { monthlyPay, parseCsv } from '../src/mileage.mjs'

const trips = parseCsv(`trip,driver,date,miles,status
C-1,Alex,2026-05-04,60,done
C-2,Alex,2026-06-10,40,done
C-3,Alex,2026-06-12,30,cancelled
C-4,Bea,2026-05-02,10000,done
C-5,Bea,2026-06-03,100,done`)

test('a driver under 10,000 miles is paid 45p a mile', () => {
  assert.deepEqual(monthlyPay(trips, 'Alex', '2026-06'), {
    driver: 'Alex',
    before: 60,
    miles: 40,
    rate: 0.45,
    pay: 18,
  })
})

test('cancelled trips are not paid', () => {
  assert.equal(monthlyPay(trips, 'Alex', '2026-06').miles, 40)
})

test('a driver past 10,000 miles is paid 25p a mile', () => {
  const row = monthlyPay(trips, 'Bea', '2026-06')
  assert.equal(row.rate, 0.25)
  assert.equal(row.pay, 25)
})
