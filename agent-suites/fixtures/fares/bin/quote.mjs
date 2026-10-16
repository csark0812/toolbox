#!/usr/bin/env node
import { argv, exit, stderr, stdout } from 'node:process'
import { dollars, fare } from '../src/fares.mjs'

const [km, minutes] = argv.slice(2).map(Number)
if (!(km >= 0) || !(minutes >= 0)) {
  stderr.write('usage: quote <km> <minutes>\n')
  exit(2)
}
stdout.write(`${dollars(fare({ km, minutes }))}\n`)
