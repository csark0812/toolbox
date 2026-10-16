#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { stdout } from 'node:process'
import { money, readStock, stockValue } from '../src/stock.mjs'

const lines = readStock(readFileSync(new URL('../data/stock.csv', import.meta.url), 'utf8'))
for (const line of lines)
  stdout.write(
    `${line.sku.padEnd(8)}${line.plant.padEnd(26)}${String(line.stock).padStart(4)}  ${money(stockValue(line)).padStart(8)}\n`,
  )
