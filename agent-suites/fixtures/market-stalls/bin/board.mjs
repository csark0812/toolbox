#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { stdout } from 'node:process'
import { totalOf } from '../src/invoice.mjs'
import { formatPrice } from '../src/money.mjs'

const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))
const settings = read('settings.json')
stdout.write(`${settings.boardTitle}\n`)
for (const stall of read('stalls.json')) {
  const cents = Math.round(totalOf(stall) * settings.eurosPerPound)
  stdout.write(
    `  ${stall.pitch}  ${stall.trader.padEnd(20)}${formatPrice(cents, ...settings.boardPrice)}\n`,
  )
}
