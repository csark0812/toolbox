#!/usr/bin/env node
import { exit, stderr, stdout } from 'node:process'
import { parseArgs } from 'node:util'
import { DEFAULT_MINUTES, endTime } from '../src/session.mjs'

let parsed
try {
  parsed = parseArgs({
    allowPositionals: true,
    options: { task: { type: 'string' }, at: { type: 'string' } },
  })
} catch (error) {
  stderr.write(`${error.message}\n`)
  exit(2)
}
const { values, positionals } = parsed
if (positionals[0] !== 'start' || !values.task) {
  stderr.write('usage: timer start --task <name> [--at HH:MM]\n')
  exit(2)
}
const now = new Date()
const at =
  values.at ??
  `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
try {
  stdout.write(`${values.task}: ${at} → ${endTime(at, DEFAULT_MINUTES)}\n`)
} catch (error) {
  stderr.write(`${error.message}\n`)
  exit(2)
}
