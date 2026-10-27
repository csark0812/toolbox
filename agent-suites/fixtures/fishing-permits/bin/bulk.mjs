import { readFileSync } from 'node:fs'
import { describe, quotePermit } from '../src/permits.mjs'

// The postal form's columns, in the order the office types them in.
const [, ...rows] = readFileSync(new URL('../data/requests.csv', import.meta.url), 'utf8')
  .trim()
  .split('\n')
for (const row of rows) {
  const [ref, angler, rods, water, days] = row.split(',')
  try {
    console.log(
      `${ref}  ${describe(quotePermit(water, Number(days) || undefined, angler || undefined, Number(rods) || undefined))}`,
    )
  } catch (error) {
    console.log(`${ref}  REJECTED: ${error.message}`)
  }
}
