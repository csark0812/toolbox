#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { kitchenSheet, ordersFor } from '../src/orders.mjs'

const [date] = argv.slice(2)
if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) {
  stderr.write('usage: orders <YYYY-MM-DD>\n')
  exit(2)
}
const orders = JSON.parse(readFileSync(new URL('../data/orders.json', import.meta.url), 'utf8'))
const sheet = kitchenSheet(ordersFor(orders, date))
if (!sheet.length) stdout.write(`no orders for ${date}\n`)
for (const { dish, count } of sheet) stdout.write(`${String(count).padStart(3)}  ${dish}\n`)
