#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { suggest } from '../src/suggest.mjs'

const word = argv[2]
if (!word) {
  stderr.write('usage: suggest <word>\n')
  exit(2)
}
const dictionary = JSON.parse(readFileSync(new URL('../data/words.json', import.meta.url), 'utf8'))
const found = suggest(dictionary, word)
if (!found.length) stdout.write('no suggestions\n')
for (const entry of found) stdout.write(`${entry.word} (${entry.distance})\n`)
