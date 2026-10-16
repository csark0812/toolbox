#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { longDate } from '../src/dates.mjs'
import { renewal } from '../src/permits.mjs'

const permits = JSON.parse(readFileSync(new URL('../data/permits.json', import.meta.url), 'utf8'))
const permit = permits.find((entry) => entry.id === argv[2])
if (!permit) {
  stderr.write(`renew: no permit ${argv[2] ?? ''}\n`)
  exit(1)
}
const { starts, ends } = renewal(permit)
stdout.write(`${permit.id}  ${permit.holder}, ${permit.street} (${permit.vehicle})\n`)
stdout.write(`  Current permit ends  ${longDate(permit.ends)}\n`)
stdout.write(`  Renewal valid        ${longDate(starts)} to ${longDate(ends)}\n`)
