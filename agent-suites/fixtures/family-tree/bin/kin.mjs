#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { describe, kinship } from '../src/kinship.mjs'

const [a, b] = argv.slice(2)
if (!a || !b) {
  stderr.write('usage: kin <id> <id>\n')
  exit(2)
}
const people = JSON.parse(readFileSync(new URL('../data/people.json', import.meta.url), 'utf8'))
const name = (id) => people.find((person) => person.id === id)?.name ?? id
try {
  const result = kinship(people, a, b)
  if (!result) stdout.write(`${name(a)} and ${name(b)} share no known ancestor.\n`)
  else
    stdout.write(
      `${name(a)} and ${name(b)}: ${describe(result)} (through ${name(result.ancestor)}, ${result.up} up, ${result.down} down)\n`,
    )
} catch (error) {
  stderr.write(`kin: ${error.message}\n`)
  exit(1)
}
