import { readFileSync } from 'node:fs'
import { describe, quotePermit } from '../src/permits.mjs'

const members = JSON.parse(readFileSync(new URL('../data/renewals.json', import.meta.url), 'utf8'))
for (const member of members)
  console.log(`${member.member}  ${describe(quotePermit(...member.lastQuote))}`)
