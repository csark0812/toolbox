#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { FLAGS, isEnabled } from '../src/flags.mjs'

const name = argv[2]
if (!FLAGS[name]) {
  stderr.write(`unknown flag: ${name}\n`)
  exit(1)
}
const users = JSON.parse(readFileSync(new URL('../data/users.json', import.meta.url), 'utf8'))
const on = users.filter((user) => isEnabled(name, user)).length
stdout.write(
  `${name}: ${on} of ${users.length} active users (${((on / users.length) * 100).toFixed(1)}%)\n`,
)
