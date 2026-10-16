#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { bakeList } from '../src/bake.mjs'

const day = argv[2]
if (!/^\d{4}-\d{2}-\d{2}$/.test(day ?? '')) {
  stderr.write('usage: bake <YYYY-MM-DD>\n')
  exit(2)
}
const orders = JSON.parse(readFileSync(new URL('../data/orders.json', import.meta.url), 'utf8'))
const list = bakeList(orders, day)
if (!list.length) stdout.write(`nothing to bake for ${day}\n`)
for (const { product, qty } of list) stdout.write(`${String(qty).padStart(3)}  ${product}\n`)
