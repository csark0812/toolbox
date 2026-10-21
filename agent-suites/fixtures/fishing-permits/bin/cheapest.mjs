import { argv } from 'node:process'
import { WATERS, describe, quotePermit } from '../src/permits.mjs'

const days = argv[2] ? Number(argv[2]) : undefined
const angler = argv[3]
const quotes = Object.keys(WATERS).map((water) => quotePermit(water, days, angler))
quotes.sort((a, b) => a.pence - b.pence)
for (const quote of quotes) console.log(describe(quote))
