#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { nonGsmCharacters } from '../src/charset.mjs'
import { fill } from '../src/notices.mjs'

const templates = JSON.parse(
  readFileSync(new URL('../data/templates.json', import.meta.url), 'utf8'),
)
const [name, ...pairs] = argv.slice(2)
if (!templates[name]) {
  stderr.write(`usage: notice <${Object.keys(templates).join('|')}> key=value ...\n`)
  exit(2)
}
const values = Object.fromEntries(
  pairs.map((pair) => [pair.slice(0, pair.indexOf('=')), pair.slice(pair.indexOf('=') + 1)]),
)
let message
try {
  message = fill(templates[name], values)
} catch (error) {
  stderr.write(`${error.message}\n`)
  exit(2)
}
stdout.write(`${message}\n`)
const outside = nonGsmCharacters(message)
if (outside.length) stderr.write(`note: ${outside.join(' ')} not in the GSM alphabet\n`)
