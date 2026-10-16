#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { formatTicket, jobTicket } from '../src/ticket.mjs'

const args = argv.slice(2)
const option = (name) => {
  const at = args.indexOf(name)
  return at === -1 ? undefined : args.splice(at, 2)[1]
}
const copies = Number(option('--copies') ?? 1)
const duplex = args.includes('--duplex')
const file = args.find((arg) => !arg.startsWith('--'))
if (!file) {
  stderr.write('usage: print <document.json> [--copies N] [--duplex]\n')
  exit(2)
}
try {
  const document = JSON.parse(readFileSync(file, 'utf8'))
  const pages = Array.from({ length: document.pages }, (_, i) => i + 1)
  stdout.write(`${formatTicket(jobTicket(document, pages, { copies, duplex }))}\n`)
} catch (error) {
  stderr.write(`${error.message}\n`)
  exit(1)
}
