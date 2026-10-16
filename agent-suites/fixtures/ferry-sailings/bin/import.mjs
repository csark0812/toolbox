#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { book } from '../src/booking.mjs'
import { SailingStore } from '../src/store.mjs'

const file = argv[2]
if (!file) {
  stderr.write('usage: import <requests.json>\n')
  exit(2)
}
const sailings = JSON.parse(readFileSync(new URL('../data/sailings.json', import.meta.url), 'utf8'))
const store = new SailingStore(sailings)
const requests = JSON.parse(readFileSync(file, 'utf8'))
const results = await Promise.all(requests.map((request) => book(store, request)))
for (const result of results)
  stdout.write(
    result.ok
      ? `${result.ref}  booked  £${(result.fare / 100).toFixed(2)}\n`
      : `${result.ref}  refused (${result.reason})\n`,
  )
const booked = results.filter((result) => result.ok).length
stdout.write(`${booked} booked, ${results.length - booked} refused\n`)
for (const sailing of await store.all())
  stdout.write(
    `${sailing.label}  cars ${sailing.cars}/${sailing.carSpaces}  seats ${sailing.passengers}/${sailing.seats}\n`,
  )
