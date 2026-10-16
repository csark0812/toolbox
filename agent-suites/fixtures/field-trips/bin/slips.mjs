#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { outstanding } from '../src/slips.mjs'

const read = (file) => JSON.parse(readFileSync(new URL(`../data/${file}`, import.meta.url), 'utf8'))
const [trip] = argv.slice(2)
try {
  const missing = outstanding(read('roster.json'), read('slips.json'), trip)
  if (!missing.length) stdout.write(`every slip for ${trip} is in\n`)
  for (const student of missing) stdout.write(`${student.form}  ${student.name}\n`)
} catch (error) {
  stderr.write(`${error.message}\n`)
  exit(2)
}
