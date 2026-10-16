#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { stdout } from 'node:process'
import { formatLine, invoiceRun, pounds } from '../src/fees.mjs'

const plots = JSON.parse(readFileSync(new URL('../data/plots.json', import.meta.url), 'utf8'))
const { lines, total } = invoiceRun(plots)
for (const line of lines) stdout.write(`${formatLine(line)}\n`)
stdout.write(`Season total ${pounds(total)}\n`)
