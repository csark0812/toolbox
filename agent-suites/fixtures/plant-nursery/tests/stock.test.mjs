import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readStock, stockValue } from '../src/stock.mjs'

const csv = [
  'sku,plant,supplier,stock,reorder_level,target,tray_size,tray_pence,discontinued',
  'LAV-3,Lavender Hidcote,Greenleaf,8,10,36,12,2880,no',
].join('\n')

test('reads numbers as numbers', () => {
  const [line] = readStock(csv)
  assert.equal(line.stock, 8)
  assert.equal(line.discontinued, false)
})

test('stock value at tray price', () => {
  assert.equal(stockValue(readStock(csv)[0]), 1920)
})
