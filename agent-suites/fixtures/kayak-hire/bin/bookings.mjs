#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { stdout } from 'node:process'

const bookings = JSON.parse(readFileSync(new URL('../data/bookings.json', import.meta.url), 'utf8'))
for (const b of bookings)
  stdout.write(
    `${b.id}  ${b.date}  ${b.out}-${b.due}  ${b.craft.padEnd(6)}  ${b.name}${b.returned ? '' : '  (out)'}\n`,
  )
