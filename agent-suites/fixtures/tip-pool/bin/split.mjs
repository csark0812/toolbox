#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { split } from '../src/pool.mjs'

const date = argv[2]
const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))
const tips = read('tips.json')[date]
if (tips === undefined) {
  stderr.write('usage: split <YYYY-MM-DD> (a day with tips)\n')
  exit(2)
}
const { shares, leftover } = split(
  read('shifts.json').filter((s) => s.date === date),
  tips,
)
const pounds = (pence) => `£${(pence / 100).toFixed(2)}`
for (const share of shares)
  stdout.write(`${share.name.padEnd(6)} ${pounds(share.pence).padStart(8)}\n`)
stdout.write(`Social fund ${pounds(leftover).padStart(3)}\n`)
