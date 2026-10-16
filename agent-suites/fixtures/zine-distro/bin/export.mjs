#!/usr/bin/env node
import { argv, exit, stderr, stdout } from 'node:process'
import { exportCsv } from '../src/csv.mjs'
import { loadOrders } from './common.mjs'

const order = loadOrders().find((entry) => entry.id === argv[2])
if (!order) {
  stderr.write('usage: export <order id>\n')
  exit(2)
}
stdout.write(exportCsv(order))
