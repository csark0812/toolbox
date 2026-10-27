import { readFileSync } from 'node:fs'
import { parsePasses, takings } from '../src/takings.mjs'

const month = process.argv[2] ?? '2026-10'
const passes = parsePasses(readFileSync(new URL('../data/passes.csv', import.meta.url), 'utf8'))
const total = takings(passes, month)
console.log(`Takings for ${month}: £${total.toLocaleString('en-GB')}`)
