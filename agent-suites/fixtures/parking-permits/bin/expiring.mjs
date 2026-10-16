#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { longDate } from '../src/dates.mjs'
import { expiringIn, renewal } from '../src/permits.mjs'

const month = argv[2]
if (!/^\d{4}-\d{2}$/.test(month ?? '')) {
  stderr.write('usage: expiring <YYYY-MM>\n')
  exit(2)
}
const permits = JSON.parse(readFileSync(new URL('../data/permits.json', import.meta.url), 'utf8'))
const list = expiringIn(permits, month)
if (!list.length) stdout.write(`No permits end in ${month}.\n`)
for (const permit of list) {
  const { starts, ends } = renewal(permit)
  stdout.write(
    `${permit.id}  ${permit.holder.padEnd(15)} ends ${longDate(permit.ends).padEnd(12)} renew ${longDate(starts)} to ${longDate(ends)}\n`,
  )
}
