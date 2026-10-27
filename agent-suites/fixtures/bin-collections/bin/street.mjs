import { readFileSync } from 'node:fs'
import { argv, exit } from 'node:process'
import { findStreet } from '../src/streets.mjs'

const streets = JSON.parse(readFileSync(new URL('../data/streets.json', import.meta.url), 'utf8'))
const name = argv[2] ?? ''
const entry = findStreet(streets, name)
if (!entry) {
  console.error(`No collection round for ${name}`)
  exit(1)
}
console.log(`${entry.street}: ${entry.rule}`)
