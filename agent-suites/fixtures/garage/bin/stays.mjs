#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, stdout } from 'node:process'
import { listStays } from '../src/stays.mjs'

const args = argv.slice(2)
const plateAt = args.indexOf('--plate')
const plate = plateAt === -1 ? undefined : args[plateAt + 1]
const stays = JSON.parse(readFileSync(new URL('../data/stays.json', import.meta.url), 'utf8'))
const rows = listStays(stays, plate)
for (const row of rows)
  stdout.write(
    `${row.plate.padEnd(9)} ${row.in.slice(0, 16)}  ${String(row.minutes).padStart(5)} min  $${(row.cents / 100).toFixed(2)}\n`,
  )
if (!rows.length) stdout.write('no stays\n')
