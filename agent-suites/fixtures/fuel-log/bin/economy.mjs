#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { stdout } from 'node:process'
import { monthly, perFill } from '../src/economy.mjs'

const fills = JSON.parse(readFileSync(new URL('../data/fills.json', import.meta.url), 'utf8'))
for (const row of perFill(fills))
  stdout.write(
    `${row.date}  ${String(row.miles).padStart(4)} mi  ${row.gallons.toFixed(1).padStart(5)} gal  ${row.mpg.toFixed(1).padStart(5)} mpg\n`,
  )
stdout.write('\n')
for (const row of monthly(fills)) stdout.write(`${row.month}  average ${row.mpg.toFixed(1)} mpg\n`)
