#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { entriesIn } from '../src/usage.mjs'

const folder = argv.slice(2).find((arg) => !arg.startsWith('--')) ?? ''
const files = JSON.parse(readFileSync(new URL('../data/listing.json', import.meta.url), 'utf8'))
const entries = entriesIn(files, folder)
if (!entries.length) {
  stderr.write(`nothing in "${folder}"\n`)
  exit(1)
}
for (const entry of entries) stdout.write(`${String(entry.bytes).padStart(14)}  ${entry.name}\n`)
