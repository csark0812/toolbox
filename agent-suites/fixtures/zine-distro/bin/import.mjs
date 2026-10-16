#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { importSheet } from '../src/csv.mjs'
import { picklist } from '../src/picklist.mjs'
import { loadOrders, printPicklist, saveOrders } from './common.mjs'

const args = argv.slice(2)
const file = args.find((arg) => !arg.startsWith('--'))
if (!file) {
  stderr.write('usage: import <csv> [--save]\n')
  exit(2)
}
const orders = loadOrders()
try {
  for (const { order: id, ...line } of importSheet(readFileSync(file, 'utf8'))) {
    const order = orders.find((entry) => entry.id === id)
    if (!order) throw new RangeError(`unknown order ${id}`)
    const existing = order.lines.find((entry) => entry.sku === line.sku)
    if (existing) existing.qty += line.qty
    else order.lines.push(line)
  }
} catch (error) {
  stderr.write(`import: ${error.message}\n`)
  exit(1)
}
printPicklist((text) => stdout.write(text), picklist(orders))
if (args.includes('--save')) {
  saveOrders(orders)
  stdout.write('saved\n')
}
