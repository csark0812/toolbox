import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseCsv } from '../src/csv.mjs'
import { dayTotals } from '../src/totals.mjs'

const csv = `time,picker,variety,kg,scale
2026-10-10 08:00,Joss,Bramley,,A
2026-10-10 08:10,Joss,Bramley,14.5,A
2026-10-10 08:20,Mina,Cox,15.0,A
2026-10-10 08:30,Joss,Bramley,0.5,A
2026-10-11 08:10,Joss,Bramley,20.0,A`

test('totals add up each picker for the day, heaviest first', () => {
  assert.deepEqual(dayTotals(parseCsv(csv), '2026-10-10'), [
    { picker: 'Joss', kg: 15, pence: 450 },
    { picker: 'Mina', kg: 15, pence: 450 },
  ])
})

test('tare readings do not count', () => {
  assert.equal(dayTotals(parseCsv(csv), '2026-10-11')[0].kg, 20)
})
