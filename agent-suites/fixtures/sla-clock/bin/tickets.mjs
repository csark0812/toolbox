#!/usr/bin/env node
import { argv, exit, stderr, stdout } from 'node:process'
import { dueDate } from '../src/due.mjs'

const [command, opened, priority] = argv.slice(2)
if (command !== 'due' || !opened || !priority) {
  stderr.write('usage: tickets due <opened YYYY-MM-DD> <P1|P2|P3>\n')
  exit(2)
}
try {
  stdout.write(`${dueDate(opened, priority)}\n`)
} catch (error) {
  stderr.write(`${error.message}\n`)
  exit(1)
}
