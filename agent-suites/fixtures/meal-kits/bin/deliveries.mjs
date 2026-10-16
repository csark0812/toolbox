#!/usr/bin/env node
import { argv, exit, stderr, stdout } from 'node:process'
import { isoDay, loadStore } from '../src/store.mjs'

const day = argv[2]
if (!/^\d{4}-\d{2}-\d{2}$/.test(day ?? '')) {
  stderr.write('usage: deliveries <YYYY-MM-DD>\n')
  exit(2)
}
const boxes = [...loadStore().values()].filter(
  (sub) => !sub.paused && isoDay(sub.nextDelivery) === day,
)
if (!boxes.length) stdout.write(`No boxes on ${day}.\n`)
for (const sub of boxes) stdout.write(`${sub.customerId}  ${sub.name.padEnd(14)}${sub.plan}\n`)
