#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { stdout } from 'node:process'
import { cell, COLUMNS } from '../src/columns.mjs'

const stalls = JSON.parse(readFileSync(new URL('../data/stalls.json', import.meta.url), 'utf8'))
const quote = (text) => (/[",]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text)
stdout.write(COLUMNS.map((column) => column.header).join(',') + '\n')
for (const stall of stalls)
  stdout.write(COLUMNS.map((column) => quote(cell(column, stall))).join(',') + '\n')
