import assert from 'node:assert/strict'
import { test } from 'node:test'
import { render } from '../src/render.mjs'
import { renderTable } from '../src/report/table.mjs'

test('a reminder letter', () => {
  const letter = render('reminder', {
    name: 'A',
    street: 'B',
    boiler: 'C',
    lastService: '2025-11-04',
    due: '2026-11-04',
    cover: 0,
  })
  assert.match(letter, /last serviced on Tue 4 Nov 2025 and is due again by Wed 4 Nov 2026/)
})

test('the report table', () => {
  const [header, row] = renderTable([{ name: 'A', due: '2026-11-04', visit: null, cover: 8900 }])
  assert.match(header, /^Customer/)
  assert.match(row, /Wed 4 Nov 2026 +- +£89\.00$/)
})
