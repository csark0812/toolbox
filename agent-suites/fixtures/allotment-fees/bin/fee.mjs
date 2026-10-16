#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { annualFee, formatLine } from '../src/fees.mjs'

const plots = JSON.parse(readFileSync(new URL('../data/plots.json', import.meta.url), 'utf8'))
const plot = plots.find((entry) => entry.plot === Number(argv[2]))
if (!plot) {
  stderr.write('usage: fee <plot number>\n')
  exit(2)
}
stdout.write(`${formatLine({ ...plot, fee: annualFee(plot) })}\n`)
