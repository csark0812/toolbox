#!/usr/bin/env node
import { argv, exit, stderr, stdout } from 'node:process'
import { picklist } from '../src/picklist.mjs'
import { loadOrders, option, printPicklist } from './common.mjs'

try {
  printPicklist(
    (text) => stdout.write(text),
    picklist(loadOrders(), option(argv.slice(2), '--sort')),
  )
} catch (error) {
  stderr.write(`picklist: ${error.message}\n`)
  exit(2)
}
