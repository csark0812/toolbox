#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { zoneFor } from '../src/zones.mjs'

const [x, y] = argv.slice(2).map(Number)
if (!Number.isFinite(x) || !Number.isFinite(y)) {
  stderr.write('usage: zone <x> <y>\n')
  exit(2)
}
const zones = JSON.parse(readFileSync(new URL('../data/zones.json', import.meta.url), 'utf8'))
stdout.write(`${zoneFor(zones, [x, y]) ?? 'outside every zone'}\n`)
