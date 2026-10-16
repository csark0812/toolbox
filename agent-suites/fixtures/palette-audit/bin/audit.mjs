#!/usr/bin/env node
import { exit, stderr, stdout } from 'node:process'
import { parseArgs } from 'node:util'
import { describePair, loadPalette } from '../src/palette.mjs'

let parsed
try {
  parsed = parseArgs({ allowPositionals: true, options: {} })
} catch (error) {
  stderr.write(`${error.message}\n`)
  exit(2)
}
const [file] = parsed.positionals
if (!file) {
  stderr.write('usage: audit <palette.json>\n')
  exit(2)
}
const palette = loadPalette(file)
stdout.write(`${palette.name}\n`)
for (const pair of palette.pairs) stdout.write(`  ${describePair(pair)}\n`)
