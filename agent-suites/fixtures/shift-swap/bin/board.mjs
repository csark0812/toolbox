#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { stdout } from 'node:process'
import { openSwaps } from '../src/board.mjs'
import { formatShift } from '../src/format.mjs'

const read = (file) => JSON.parse(readFileSync(new URL(`../data/${file}`, import.meta.url), 'utf8'))
const site = read('site.json')
const swaps = openSwaps(read('shifts.json'))
stdout.write(`${site.name}: ${swaps.length} shifts up for swapping\n`)
for (const shift of swaps) stdout.write(`${formatShift(shift, site)}\n`)
