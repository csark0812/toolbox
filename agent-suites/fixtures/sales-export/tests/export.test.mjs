import assert from 'node:assert/strict'
import { test } from 'node:test'
import { field } from '../src/csv.mjs'
import { exportCsv } from '../src/export.mjs'

const capture = () => {
  const chunks = []
  return { chunks, write: (text) => void chunks.push(text), text: () => chunks.join('') }
}

test('quotes fields that need it', () => {
  assert.equal(field('plain'), 'plain')
  assert.equal(field('a,b'), '"a,b"')
  assert.equal(field('say "hi"'), '"say ""hi"""')
  assert.equal(field(null), '')
})

test('writes a header and one line per sale', () => {
  const sink = capture()
  const result = exportCsv(
    [
      {
        orderId: 'SO-1',
        at: Date.UTC(2026, 9, 14, 23, 59),
        customer: ' Eli Moss, Jr. ',
        country: 'us',
        sku: 'SKU-9',
        qty: 2,
        amountCents: 1205,
        note: null,
      },
      {
        orderId: 'SO-2',
        at: Date.UTC(2026, 9, 14, 1),
        customer: 'Ana Lima',
        country: 'de',
        sku: 'SKU-3',
        qty: 1,
        amountCents: -50,
        note: 'gift wrap',
      },
    ],
    sink,
  )
  assert.equal(
    sink.text(),
    'order_id,date,customer,country,sku,qty,amount,note\n' +
      'SO-1,2026-10-14,"Eli Moss, Jr.",US,SKU-9,2,12.05,\n' +
      'SO-2,2026-10-14,Ana Lima,DE,SKU-3,1,-0.50,gift wrap\n',
  )
  assert.equal(result.rows, 2)
})

test('an empty export is just the header', () => {
  const sink = capture()
  assert.deepEqual(exportCsv([], sink), { rows: 0, bytes: 51 })
  assert.equal(sink.text(), 'order_id,date,customer,country,sku,qty,amount,note\n')
})
