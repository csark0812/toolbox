#!/usr/bin/env node
import { argv, exit, stderr, stdout } from 'node:process'
import { invoice, lineTotal, pounds } from '../src/orders.mjs'
import { loadOrders } from './common.mjs'

const order = loadOrders().find((entry) => entry.id === argv[2])
if (!order) {
  stderr.write('usage: invoice <order id>\n')
  exit(2)
}
const bill = invoice(order)
stdout.write(`Invoice ${bill.id} for ${bill.shop}\n`)
for (const line of bill.lines)
  stdout.write(
    `${String(line.qty).padStart(3)} x ${line.title.padEnd(26)} @ ${pounds(line.unitPence).padStart(6)}  ${pounds(lineTotal(line)).padStart(7)}\n`,
  )
stdout.write(`${'Total'.padStart(45)}  ${pounds(bill.total).padStart(7)}\n`)
