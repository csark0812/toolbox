#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { bill, pounds } from '../src/pricing.mjs'

const bookings = JSON.parse(readFileSync(new URL('../data/bookings.json', import.meta.url), 'utf8'))
const booking = bookings.find((b) => b.id === argv[2])
if (!booking) {
  stderr.write('usage: bill <booking id>\n')
  exit(2)
}
const b = bill(booking)
stdout.write(`Hire      ${pounds(b.hire)}\nDeposit   ${pounds(b.deposit)}\n`)
if (b.late) stdout.write(`Late fee  ${pounds(b.late)}\n`)
stdout.write(booking.returned ? `Refund    ${pounds(b.refund)}\n` : 'Still out\n')
