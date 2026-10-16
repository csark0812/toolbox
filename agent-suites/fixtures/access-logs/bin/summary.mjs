#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { summarize } from '../src/summarize.mjs'

if (!argv[2]) {
  stderr.write('usage: npm run summary -- <access.log>\n')
  exit(1)
}
const { routes, malformed } = summarize(readFileSync(argv[2], 'utf8').split('\n').filter(Boolean))
stdout.write('route                               count  5xx   p50   p95\n')
for (const r of routes)
  stdout.write(
    `${r.route.padEnd(34)} ${String(r.count).padStart(6)} ${String(r.errors).padStart(4)} ${String(r.p50).padStart(5)} ${String(r.p95).padStart(5)}\n`,
  )
if (malformed) stdout.write(`malformed lines: ${malformed}\n`)
