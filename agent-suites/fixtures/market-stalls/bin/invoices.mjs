#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { stdout } from 'node:process'
import { invoiceLines } from '../src/invoice.mjs'

const stalls = JSON.parse(readFileSync(new URL('../data/stalls.json', import.meta.url), 'utf8'))
stdout.write(stalls.map((stall) => invoiceLines(stall).join('\n')).join('\n\n') + '\n')
